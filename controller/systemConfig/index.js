/**
 * Copyright © 2026, Eden Sign Inc. ALL RIGHTS RESERVED.
 *
 * System Configuration Controller
 * Manages global application settings (such as AI Page Agent configurations).
 * Implements a hybrid database + local file storage to guarantee fallback reliability.
 */

const fs = require('fs');
const path = require('path');
const supabase = require("../../supabase");
const Utility = require("../../utility");

const backupFilePath = path.join(__dirname, '../../system_config.json');

const DEFAULT_CONFIG = {
    enabled: true,
    provider: "gemini",
    model: "google/gemma-4-26b-a4b-it:free",
    baseURL: "http://localhost:8080/api/v1/ai-agent",
    apiKey: ""
};

// Reads local file backup
const readBackup = () => {
    try {
        if (fs.existsSync(backupFilePath)) {
            const content = fs.readFileSync(backupFilePath, 'utf8');
            return JSON.parse(content);
        }
    } catch (err) {
        console.error("✦ SystemConfig: Failed to read local system_config.json backup:", err);
    }
    return null;
};

// Writes local file backup
const writeBackup = (config) => {
    try {
        fs.writeFileSync(backupFilePath, JSON.stringify(config, null, 2), 'utf8');
    } catch (err) {
        console.error("✦ SystemConfig: Failed to write local system_config.json backup:", err);
    }
};

const systemConfigController = {
    /**
     * Get the current Page Agent configuration
     */
    getPageAgentConfig: async (req, res) => {
        try {
            console.log("✦ Fetching Page Agent configuration...");
            
            // Try fetching from Supabase database
            const { data, error } = await supabase
                .from('system_config')
                .select('value')
                .eq('key', 'page_agent')
                .maybeSingle();

            if (error) {
                console.warn("✦ SystemConfig DB Select Error (falling back to file backup):", error.message);
                const localConfig = readBackup();
                return res.status(200).send(Utility.formatResponse(200, localConfig || DEFAULT_CONFIG));
            }

            if (data && data.value) {
                // Keep local backup synchronized
                writeBackup(data.value);
                return res.status(200).send(Utility.formatResponse(200, data.value));
            }

            // If not in database, check local backup
            const localConfig = readBackup();
            if (localConfig) {
                return res.status(200).send(Utility.formatResponse(200, localConfig));
            }

            // Final fallback
            return res.status(200).send(Utility.formatResponse(200, DEFAULT_CONFIG));
        } catch (err) {
            console.error("✦ getPageAgentConfig error:", err);
            const localConfig = readBackup();
            res.status(200).send(Utility.formatResponse(200, localConfig || DEFAULT_CONFIG));
        }
    },

    /**
     * Update the Page Agent configuration (Admin Only)
     */
    updatePageAgentConfig: async (req, res) => {
        try {
            console.log("✦ Updating Page Agent configuration. Admin ID:", req.userId);
            
            // 1. Authorize Admin role
            const { data: user, error: userError } = await supabase
                .from('users')
                .select('type')
                .eq('id', req.userId)
                .single();

            if (userError || !user) {
                console.error("✦ Admin auth query error:", userError);
                return res.status(401).send(Utility.formatResponse(401, "Failed to authenticate admin token"));
            }

            if (user.type !== 'admin') {
                return res.status(403).send(Utility.formatResponse(403, "Access Denied: Only administrators can update configuration"));
            }

            // 2. Build configuration payload
            const { enabled, provider, model, baseURL, apiKey } = req.body;
            const configPayload = {
                enabled: enabled !== undefined ? !!enabled : true,
                provider: provider || DEFAULT_CONFIG.provider,
                model: model || DEFAULT_CONFIG.model,
                baseURL: baseURL || DEFAULT_CONFIG.baseURL,
                apiKey: apiKey !== undefined ? apiKey : ""
            };

            // 3. Save to backup file
            writeBackup(configPayload);

            // 4. Try updating/upserting to Supabase database
            const { error: dbError } = await supabase
                .from('system_config')
                .upsert({
                    key: 'page_agent',
                    value: configPayload,
                    updated_at: new Date().toISOString()
                });

            if (dbError) {
                console.warn("✦ SystemConfig DB Update Warning (Saved locally only):", dbError.message);
                return res.status(200).send(Utility.formatResponse(200, {
                    msg: "Updated locally. Note: Database sync pending.",
                    config: configPayload
                }));
            }

            console.log("✦ SystemConfig DB & File updated successfully.");
            res.status(200).send(Utility.formatResponse(200, "Updated Successfully"));
        } catch (err) {
            console.error("✦ updatePageAgentConfig error:", err);
            res.status(500).send(Utility.formatResponse(500, err.message || "Internal server error"));
        }
    }
};

module.exports = systemConfigController;

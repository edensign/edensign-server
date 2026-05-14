/**
 * Copyright © 2023, Eden Sign Inc. ALL RIGHTS RESERVED.
 */

const supabase = require("../../supabase");
const Utility = require("../../utility");

const addressController = {
    /** Create address in the database */
    create: async (req, res) => {
        try {
            const payload = { ...req.body, created_by: req.body.userId };
            delete payload.userId;

            const { error } = await supabase
                .from('address')
                .insert(payload);

            if (error) throw error;
            res.status(200).send(Utility.formatResponse(200, `Success`));
        } catch (err) {
            console.error("Create address error:", err);
            res.status(409).send(Utility.formatResponse(409, "Error"));
        }
    },

    /** Get address from the database */
    getAddress: async (req, res) => {
        try {
            const { parent, parent_id } = req.params;
            
            const { data, error } = await supabase
                .from('address')
                .select('*')
                .eq('parent', parent)
                .eq('parent_id', parent_id)
                .single();

            if (error && error.code !== 'PGRST116') throw error; // PGRST116 is No Rows Found

            if (data) {
                res.status(200).send(Utility.formatResponse(200, data));
            } else {
                // Return success with null if not found to avoid breaking multiple API calls on frontend
                res.status(200).send(Utility.formatResponse(200, null));
            }
        } catch (err) {
            console.error("Get address error:", err);
            res.status(500).send(Utility.formatResponse(500, err.message));
        }
    },

    /** Updating address in the database */
    updateAddress: async (req, res) => {
        try {
            const payload = { ...req.body, updated_by: req.body.userId, updated_at: new Date().toISOString() };
            const parent = payload.parent;
            const parent_id = payload.parent_id;
            
            if (!parent || !parent_id) {
                return res.status(400).send(Utility.formatResponse(400, "Missing parent or parent_id in address update"));
            }

            delete payload.userId;
            delete payload.parent;
            delete payload.parent_id;

            // Check if address exists for this parent/parent_id
            const { data: existingAddress, error: selectError } = await supabase
                .from('address')
                .select('id')
                .eq('parent', parent)
                .eq('parent_id', parent_id)
                .maybeSingle();

            if (selectError) throw selectError;

            let finalError;
            if (existingAddress) {
                // Update existing record
                const { error: updateError } = await supabase
                    .from('address')
                    .update(payload)
                    .eq('id', existingAddress.id);
                finalError = updateError;
            } else {
                // Create new record if it doesn't exist
                const { error: insertError } = await supabase
                    .from('address')
                    .insert({ 
                        ...payload, 
                        parent, 
                        parent_id, 
                        created_at: new Date().toISOString(),
                        created_by: req.userId 
                    });
                finalError = insertError;
            }

            if (finalError) throw finalError;
            res.status(200).send(Utility.formatResponse(200, `Updated Successfully`));
        } catch (err) {
            console.error("Update address error:", err);
            res.status(500).send(Utility.formatResponse(500, err.message));
        }
    }
};

module.exports = addressController;

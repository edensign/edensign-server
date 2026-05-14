/**
 * Copyright © 2023, Eden Sign Inc. ALL RIGHTS RESERVED.
 */

const supabase = require("../../supabase");
const Utility = require("../../utility");

const commonController = {
    /** Find user of specified model from the database */
    getByPk: async (req, res) => {
        try {
            const tableName = Utility.getValidTable(req.params.table);
            
            if (!tableName) {
                return res.status(400).send(Utility.formatResponse(400, `Invalid table name`));
            }

            const { data, error } = await supabase
                .from(tableName)
                .select('*')
                .eq('id', req.params.id)
                .single();

            if (error && error.code !== 'PGRST116') throw error;

            if (data) {
                res.status(200).send(Utility.formatResponse(200, data));
            } else {
                // Return success with null if not found to avoid breaking multiple API calls on frontend
                res.status(200).send(Utility.formatResponse(200, null));
            }
        } catch (err) {
            console.error("Common getByPk error:", err);
            res.status(500).send(Utility.formatResponse(500, err.message));
        }
    }
}

module.exports = commonController;

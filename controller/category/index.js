/**
 * Copyright © 2026, Eden Sign Inc. ALL RIGHTS RESERVED.
 */

const supabase = require("../../supabase");
const Utility = require("../../utility");

const categoryController = {
    /** Get all categories */
    getCategories: async (req, res) => {
        try {
            const { data, error } = await supabase
                .from('category')
                .select('*')
                .order('name', { ascending: true });

            if (error) throw error;

            res.status(200).send(Utility.formatResponse(200, data));
        } catch (err) {
            console.error("getCategories error:", err);
            res.status(500).send(Utility.formatResponse(500, err.message));
        }
    }
};

module.exports = categoryController;

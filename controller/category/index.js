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
                .order('id', { ascending: false });

            if (error) throw error;

            res.status(200).send(Utility.formatResponse(200, data));
        } catch (err) {
            console.error("getCategories error:", err);
            res.status(500).send(Utility.formatResponse(500, err.message));
        }
    },

    /** Creating category in the database */
    createCategory: async (req, res) => {
        try {
            const { name, description } = req.body;
            if (!name) {
                return res.status(400).send(Utility.formatResponse(400, "Category name is required"));
            }

            const { data, error } = await supabase
                .from('category')
                .insert({ name, description })
                .select('id')
                .single();

            if (error) throw error;

            res.status(200).send(Utility.formatResponse(200, { id: data.id }));
        } catch (err) {
            console.error("createCategory error:", err);
            res.status(409).send(Utility.formatResponse(409, err.message));
        }
    },

    /** Updating category in database */
    updateCategory: async (req, res) => {
        try {
            const { name, description } = req.body;
            const { error } = await supabase
                .from('category')
                .update({ name, description })
                .eq('id', req.params.id);

            if (error) throw error;
            res.status(200).send(Utility.formatResponse(200, `Updated Successfully`));
        } catch (err) {
            console.error("updateCategory error:", err);
            res.status(500).send(Utility.formatResponse(500, err.message));
        }
    },

    /** Deleting category from database */
    deleteCategory: async (req, res) => {
        try {
            const { error } = await supabase
                .from('category')
                .delete()
                .eq('id', req.params.id);

            if (error) throw error;
            res.status(200).send(Utility.formatResponse(200, `Deleted Successfully`));
        } catch (err) {
            console.error("deleteCategory error:", err);
            res.status(500).send(Utility.formatResponse(500, err.message));
        }
    }
};

module.exports = categoryController;

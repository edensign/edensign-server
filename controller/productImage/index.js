/**
 * Copyright © 2023, Eden Sign Inc. ALL RIGHTS RESERVED.
 */

const supabase = require("../../supabase");
const Utility = require("../../utility");

const ProductImageController = {
    /** Get product image/images from database based on parent_id */
    getProductImage: async (req, res) => {
        try {
            const { data, error } = await supabase
                .from('product_image')
                .select('*')
                .eq('parent_id', req.params.parent_id)
                .order('priority', { ascending: false });

            if (error) throw error;

            if (data && data.length > 0) {
                res.status(200).send(Utility.formatResponse(200, data));
            } else {
                res.status(404).send(Utility.formatResponse(404, `Data Not Found`));
            }
        } catch (err) {
            console.error("getProductImage error:", err);
            res.status(500).send(Utility.formatResponse(500, err.message));
        }
    },

    /** Create new product image */
    create: async (req, res) => {
        try {
            const payload = { ...req.body, created_by: req.body.userId };
            delete payload.userId;

            const { error } = await supabase
                .from('product_image')
                .insert(payload);

            if (error) throw error;
            res.status(200).send(Utility.formatResponse(200, `Success`));
        } catch (err) {
            console.error("create productImage error:", err);
            res.status(409).send(Utility.formatResponse(409, "Error"));
        }
    },

    /** Updating product image in the database */
    updateProductImage: async (req, res) => {
        try {
            const payload = { ...req.body, updated_by: req.body.userId, updated_at: new Date().toISOString() };
            const parent_id = payload.parent_id;
            delete payload.userId;
            delete payload.parent_id;

            const { error } = await supabase
                .from('product_image')
                .update(payload)
                .eq('parent_id', parent_id);

            if (error) throw error;
            res.status(200).send(Utility.formatResponse(200, `Updated Successfully`));
        } catch (err) {
            console.error("updateProductImage error:", err);
            res.status(500).send(Utility.formatResponse(500, err.message));
        }
    },

    /** Delete product images from the db */
    deleteProductImage: async (req, res) => {
        try {
            const payload = req.body;

            const { error } = await supabase
                .from('product_image')
                .delete()
                .eq('parent_id', payload.parent_id);

            if (error) throw error;
            res.status(200).send(Utility.formatResponse(200, `Deleted Successfully`));
        } catch (err) {
            console.error("deleteProductImage error:", err);
            res.status(500).send(Utility.formatResponse(500, err.message));
        }
    },

    /** Upload product image to abs/s3 */
    uploadProductImage: async (req, res) => {
        try {
            const folder = req.body.folder;
            const name = req.body.name;
            const file = req.files.file;
            const fullPath = `${folder}/${name}`;

            Utility.uploadToS3(fullPath, file, res);
        } catch (err) {
            console.error("uploadProductImage error:", err);
            res.status(500).send(Utility.formatResponse(500, err.message || err));
        }
    }
};

module.exports = ProductImageController;

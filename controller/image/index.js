/**
 * Copyright © 2023, Eden Sign Inc. ALL RIGHTS RESERVED.
 */

const supabase = require("../../supabase");
const Utility = require("../../utility");

const ImageController = {
    /** Get image/images from database based on parent */
    getImage: async (req, res) => {
        try {
            const { data, error } = await supabase
                .from('images')
                .select('*')
                .eq('parent', req.params.parent)
                .eq('parent_id', req.params.parent_id)
                .order('priority', { ascending: false });

            if (error) throw error;

            if (data && data.length > 0) {
                res.status(200).send(Utility.formatResponse(200, data));
            } else {
                // Return success with empty array if not found to avoid breaking multiple API calls on frontend
                res.status(200).send(Utility.formatResponse(200, []));
            }
        } catch (err) {
            console.error("getImage error:", err);
            res.status(500).send(Utility.formatResponse(500, err.message));
        }
    },

    /** Create new image */
    create: async (req, res) => {
        try {
            const payload = { ...req.body, created_by: req.body.userId };
            delete payload.userId;

            const { error } = await supabase
                .from('images')
                .insert(payload);

            if (error) throw error;
            res.status(200).send(Utility.formatResponse(200, `Success`));
        } catch (err) {
            console.error("create image error:", err);
            res.status(409).send(Utility.formatResponse(409, "Error"));
        }
    },

    /** Updating image in the database based on parent */
    updateImage: async (req, res) => {
        try {
            const payload = { ...req.body, updated_by: req.body.userId, updated_at: new Date().toISOString() };
            const { parent, parent_id } = payload;
            
            delete payload.userId;
            delete payload.parent;
            delete payload.parent_id;

            const { error } = await supabase
                .from('images')
                .update(payload)
                .eq('parent', parent)
                .eq('parent_id', parent_id);

            if (error) throw error;
            res.status(200).send(Utility.formatResponse(200, `Updated Successfully`));
        } catch (err) {
            console.error("updateImage error:", err);
            res.status(500).send(Utility.formatResponse(500, err.message));
        }
    },

    /** Delete images from the db */
    deleteImage: async (req, res) => {
        try {
            const { parent, parent_id } = req.body;

            const { error } = await supabase
                .from('images')
                .delete()
                .eq('parent', parent)
                .eq('parent_id', parent_id);

            if (error) throw error;
            res.status(200).send(Utility.formatResponse(200, `Deleted Successfully`));
        } catch (err) {
            console.error("deleteImage error:", err);
            res.status(500).send(Utility.formatResponse(500, err.message));
        }
    },

    /** Upload image to abs/s3 */
    uploadImage: (req, res) => {
        try {
            const { document } = req.files;
            const { folder } = req.body;
            Utility.uploadToS3(folder, document, res);
        } catch (err) {
            console.log("uploadImage error", err);
            res.status(500).send(Utility.formatResponse(500, err.message));
        }
    }
};

module.exports = ImageController;

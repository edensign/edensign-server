/**
 * Copyright © 2023, Eden Sign Inc. ALL RIGHTS RESERVED.
 */

const supabase = require("../../supabase");
const Utility = require("../../utility");

const academyController = {
    /** Get all academy courses for admin with pagination and search */
    getAll: async (req, res) => {
        try {
            const { page, size, search } = req.query;
            const { limit, offset } = Utility.getPagination(parseInt(page), parseInt(size));

            let query = supabase
                .from('academy')
                .select('*', { count: 'exact' });

            if (search) {
                query = query.or(`title.ilike.%${search}%,category.ilike.%${search}%`);
            }

            const { data, count, error } = await query
                .order('updated_at', { ascending: false })
                .range(offset, offset + limit - 1);

            if (error) throw error;

            if (count > 0) {
                res.status(200).send(Utility.formatResponse(200, { count, rows: data }));
            } else {
                res.status(404).send(Utility.formatResponse(404, `No Data Found`));
            }
        } catch (err) {
            console.error("Academy getAll error:", err);
            res.status(500).send(Utility.formatResponse(500, err.message));
        }
    },

    /** Get active academy courses for website */
    getPublicList: async (req, res) => {
        try {
            const { data, error } = await supabase
                .from('academy')
                .select('*')
                .eq('status', 'active')
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (data && data.length > 0) {
                res.status(200).send(Utility.formatResponse(200, data));
            } else {
                res.status(404).send(Utility.formatResponse(404, `No Data Found`));
            }
        } catch (err) {
            console.error("Academy getPublicList error:", err);
            res.status(500).send(Utility.formatResponse(500, err.message));
        }
    },

    /** Create a new academy course */
    create: async (req, res) => {
        try {
            const payload = { ...req.body, created_by: req.body.userId };
            delete payload.userId;

            if (!payload.thumbnail_url && payload.youtube_link) {
                const videoId = payload.youtube_link.split('v=')[1]?.split('&')[0] || payload.youtube_link.split('/').pop();
                if (videoId) {
                    payload.thumbnail_url = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
                }
            }

            const { data, error } = await supabase
                .from('academy')
                .insert(payload)
                .select('id')
                .single();

            if (error) throw error;

            res.status(200).send(Utility.formatResponse(200, { id: data.id }));
        } catch (err) {
            console.error("Academy create error:", err);
            res.status(409).send(Utility.formatResponse(409, err.message));
        }
    },

    /** Update an academy course */
    update: async (req, res) => {
        try {
            const payload = { ...req.body, updated_by: req.body.userId, updated_at: new Date().toISOString() };
            const id = payload.id;
            delete payload.userId;
            delete payload.id;

            if (payload.youtube_link) {
                const videoId = payload.youtube_link.split('v=')[1]?.split('&')[0] || payload.youtube_link.split('/').pop();
                if (videoId) {
                    payload.thumbnail_url = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
                }
            }

            const { error } = await supabase
                .from('academy')
                .update(payload)
                .eq('id', id);

            if (error) throw error;

            res.status(200).send(Utility.formatResponse(200, `Updated Successfully`));
        } catch (err) {
            console.error("Academy update error:", err);
            res.status(500).send(Utility.formatResponse(500, err.message));
        }
    },

    /** Delete an academy course */
    delete: async (req, res) => {
        try {
            const { error } = await supabase
                .from('academy')
                .delete()
                .eq('id', req.query.id);

            if (error) throw error;

            res.status(200).send(Utility.formatResponse(200, `Deleted Successfully`));
        } catch (err) {
            console.error("Academy delete error:", err);
            res.status(500).send(Utility.formatResponse(500, err.message));
        }
    }
};

module.exports = academyController;

/**
 * Copyright © 2023, Eden Sign Inc. ALL RIGHTS RESERVED.
 */

const supabase = require("../../supabase");
const Utility = require("../../utility");

const ServiceController = {
    /** Get services from database based on query type, page, size and search if provided */
    getAll: async (req, res) => {
        try {
            const { page, size, search } = req.query;
            const { limit, offset } = Utility.getPagination(parseInt(page), parseInt(size));

            let query = supabase
                .from('service')
                .select('*', { count: 'exact' });

            if (search) {
                query = query.or(`name.ilike.%${search}%,status.ilike.${search}%`);
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
            console.error("Service getAll error:", err);
            res.status(500).send(Utility.formatResponse(500, err.message));
        }
    },

    /** Creating Service in the database */
    createService: async (req, res) => {
        try {
            const payload = { ...req.body, created_by: req.body.userId };
            delete payload.userId;

            const { data, error } = await supabase
                .from('service')
                .insert(payload)
                .select('id')
                .single();

            if (error) throw error;

            res.status(200).send(Utility.formatResponse(200, { id: data.id }));
        } catch (err) {
            console.error("createService error:", err);
            res.status(409).send(Utility.formatResponse(409, err.message));
        }
    },

    /** Updating Service in the database */
    updateService: async (req, res) => {
        try {
            const payload = { ...req.body, updated_by: req.body.userId, updated_at: new Date().toISOString() };
            const id = payload.id;
            delete payload.userId;
            delete payload.id;

            const { error } = await supabase
                .from('service')
                .update(payload)
                .eq('id', id);

            if (error) throw error;

            res.status(200).send(Utility.formatResponse(200, `Updated Successfully`));
        } catch (err) {
            console.error("updateService error:", err);
            res.status(500).send(Utility.formatResponse(500, err.message));
        }
    }
};

module.exports = ServiceController;

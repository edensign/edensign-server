/**
 * Copyright © 2023, Eden Sign Inc. ALL RIGHTS RESERVED.
 */

const supabase = require("../../supabase");
const Utility = require("../../utility");

const salonController = {
    /** Get salons from database based on query type, page, size and search if provided */
    getSalons: async (req, res) => {
        try {
            const { page, size, search } = req.query;
            const { limit, offset } = Utility.getPagination(parseInt(page), parseInt(size));
            const userId = req.userId;

            let query = supabase
                .from('salon')
                .select('*, Creator:users!created_by(username), Referrer:users!referral_by(username)', { count: 'exact' });

            if (userId) {
                // Fetch user to check role
                const { data: user } = await supabase.from('users').select('type').eq('id', userId).single();
                if (user && user.type === 'sales_executive') {
                    query = query.or(`created_by.eq.${userId},referral_by.eq.${userId}`);
                }
            }

            if (search) {
                query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,status.ilike.${search}%`);
            }

            const { data, error, count } = await query
                .order('updated_at', { ascending: false })
                .range(offset, offset + limit - 1);

            if (error) throw error;

            if (count > 0) {
                res.status(200).send(Utility.formatResponse(200, { count, rows: data }));
            } else {
                res.status(404).send(Utility.formatResponse(404, `No Data Found`));
            }
        } catch (err) {
            console.error("getSalons error:", err);
            res.status(500).send(Utility.formatResponse(500, err.message));
        }
    },

    /** Creating salon in the database */
    createSalon: async (req, res) => {
        try {
            const payload = { ...req.body, created_by: req.body.userId };
            delete payload.userId;

            const { data, error } = await supabase
                .from('salon')
                .insert(payload)
                .select('id')
                .single();

            if (error) throw error;
            res.status(200).send(Utility.formatResponse(200, { id: data.id }));
        } catch (err) {
            console.error("createSalon error:", err);
            res.status(409).send(Utility.formatResponse(409, err.message || "Conflict"));
        }
    },

    /** Updating Salon in the database */
    updateSalon: async (req, res) => {
        try {
            const payload = { ...req.body, updated_by: req.body.userId, updated_at: new Date().toISOString() };
            const id = payload.id;
            delete payload.userId;
            delete payload.id;

            const { error } = await supabase
                .from('salon')
                .update(payload)
                .eq('id', id);

            if (error) throw error;
            res.status(200).send(Utility.formatResponse(200, `Updated Successfully`));
        } catch (err) {
            console.error("updateSalon error:", err);
            res.status(500).send(Utility.formatResponse(500, err.message));
        }
    },

    /** Finding salon in the database from user id that is received */
    getSalonByUserId: async (req, res) => {
        try {
            const { data, error } = await supabase
                .from('salon')
                .select('*')
                .eq('user_id', req.body.id)
                .single();

            if (error && error.code !== 'PGRST116') throw error; // PGRST116 is No Rows Found

            if (data) {
                res.status(200).send(Utility.formatResponse(200, data));
            } else {
                res.status(404).send(Utility.formatResponse(404, `No Data Found`));
            }
        } catch (err) {
            console.error("getSalonByUserId error:", err);
            res.status(500).send(Utility.formatResponse(500, err.message));
        }
    },

    /** Get all the salons & their associated addresses (uses RPC) */
    getSalonList: async (req, res) => {
        try {
            const isFeatured = req.query.is_featured ? true : null;
            const isFranchise = req.query.is_franchise ? true : null;
            const gender = req.query.gender || null;

            const data = await Utility.executeRpc('get_salon_list', {
                p_is_featured: isFeatured,
                p_is_franchise: isFranchise,
                p_gender: gender
            });

            if (data && data.length > 0) {
                res.status(200).send(Utility.formatResponse(200, data));
            } else {
                res.status(404).send(Utility.formatResponse(404, `No Data Found`));
            }
        } catch (err) {
            console.error("getSalonList error:", err);
            res.status(500).send(Utility.formatResponse(500, err.message));
        }
    },

    /** Get the salons, their associated addresses & their images (uses RPC) */
    getSalonDetail: async (req, res) => {
        try {
            const salonCode = req.body.code;
            const data = await Utility.executeRpc('get_salon_detail', { p_salon_code: salonCode });

            if (data && data.length > 0) {
                const salonDetail = { salon: {}, images: [] };
                data.forEach(row => {
                    if (Object.keys(salonDetail.salon).length === 0) {
                        salonDetail.salon = { ...row };
                        delete salonDetail.salon.image_src;
                    }
                    if (row.image_src) {
                        salonDetail.images.push(row.image_src);
                    }
                });
                res.status(200).send(Utility.formatResponse(200, salonDetail));
            } else {
                res.status(404).send(Utility.formatResponse(404, `No Data Found`));
            }
        } catch (err) {
            console.error("getSalonDetail error:", err);
            res.status(500).send(Utility.formatResponse(500, err.message));
        }
    },

    /** Get salon inventory data - salons with stock information */
    getSalonInventory: async (req, res) => {
        try {
            const { page, size, search } = req.query;
            const { limit, offset } = Utility.getPagination(parseInt(page), parseInt(size));

            let query = supabase
                .from('salon')
                .select('id, name, salon_code, sku, stock_quantity, low_stock_threshold, status, type, area, updated_at', { count: 'exact' });

            if (search) {
                query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%,salon_code.ilike.%${search}%`);
            }

            const { data, error, count } = await query
                .order('updated_at', { ascending: false })
                .range(offset, offset + limit - 1);

            if (error) throw error;

            if (count > 0) {
                res.status(200).send(Utility.formatResponse(200, { count, rows: data }));
            } else {
                res.status(404).send(Utility.formatResponse(404, `No Data Found`));
            }
        } catch (err) {
            console.error("getSalonInventory error:", err);
            res.status(500).send(Utility.formatResponse(500, err.message));
        }
    },

    /** Update salon inventory stock */
    updateSalonInventory: async (req, res) => {
        try {
            const { id, stock_quantity, low_stock_threshold, sku } = req.body;
            const updateData = { updated_by: req.body.userId, updated_at: new Date().toISOString() };

            if (stock_quantity !== undefined) updateData.stock_quantity = stock_quantity;
            if (low_stock_threshold !== undefined) updateData.low_stock_threshold = low_stock_threshold;
            if (sku !== undefined) updateData.sku = sku;

            const { error } = await supabase
                .from('salon')
                .update(updateData)
                .eq('id', id);

            if (error) throw error;
            res.status(200).send(Utility.formatResponse(200, `Salon Inventory Updated Successfully`));
        } catch (err) {
            console.error("updateSalonInventory error:", err);
            res.status(500).send(Utility.formatResponse(500, err.message));
        }
    },

    /** Get salon stats for dashboard (specifically for sales_executive) */
    getSalonStats: async (req, res) => {
        try {
            const userId = req.userId;

            const { count: createdCount, error: err1 } = await supabase
                .from('salon')
                .select('*', { count: 'exact', head: true })
                .eq('created_by', userId);
            if (err1) throw err1;

            const { count: referredCount, error: err2 } = await supabase
                .from('salon')
                .select('*', { count: 'exact', head: true })
                .eq('referral_by', userId);
            if (err2) throw err2;

            const { count: activeCount, error: err3 } = await supabase
                .from('salon')
                .select('*', { count: 'exact', head: true })
                .eq('status', 'active')
                .or(`created_by.eq.${userId},referral_by.eq.${userId}`);
            if (err3) throw err3;

            res.status(200).send(Utility.formatResponse(200, {
                totalCreated: createdCount || 0,
                totalReferred: referredCount || 0,
                totalActive: activeCount || 0
            }));
        } catch (err) {
            console.error("getSalonStats error:", err);
            res.status(500).send(Utility.formatResponse(500, err.message));
        }
    }
};

module.exports = salonController;

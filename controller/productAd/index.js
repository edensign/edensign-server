/**
 * Copyright © 2023, Eden Sign Inc. ALL RIGHTS RESERVED.
 */

const supabase = require("../../supabase");
const Utility = require("../../utility");

const productAdController = {
    /** Get active sponsored products ordered by ad_budget DESC */
    getSponsored: async (req, res) => {
        try {
            const data = await Utility.executeRpc('get_sponsored_products');

            if (data && data.length > 0) {
                res.status(200).send(Utility.formatResponse(200, data));
            } else {
                res.status(404).send(Utility.formatResponse(404, `No Data Found`));
            }
        } catch (err) {
            console.error("getSponsored error:", err);
            res.status(500).send(Utility.formatResponse(500, err.message));
        }
    },

    /** Get paginated list of all product ads (for admin, company, or distributor) */
    getAll: async (req, res) => {
        try {
            const { page = 0, size = 10, search } = req.query;
            const { limit, offset } = Utility.getPagination(parseInt(page), parseInt(size));

            // Check logged in user type to filter results
            const { data: userRecord } = await supabase
                .from('users')
                .select('type')
                .eq('id', req.body.userId)
                .single();

            const userType = userRecord?.type;
            let productIds = [];

            if (userType === 'distributor') {
                const { data: prods } = await supabase
                    .from('product')
                    .select('id')
                    .eq('created_by', req.body.userId);
                productIds = prods ? prods.map(p => p.id) : [];
                if (productIds.length === 0) {
                    return res.status(200).send(Utility.formatResponse(200, { count: 0, rows: [] }));
                }
            } else if (userType === 'company') {
                const { data: compRec } = await supabase
                    .from('company')
                    .select('id')
                    .eq('user_id', req.body.userId)
                    .single();
                if (compRec) {
                    const { data: prods } = await supabase
                        .from('product')
                        .select('id')
                        .eq('company_id', compRec.id);
                    productIds = prods ? prods.map(p => p.id) : [];
                }
                if (productIds.length === 0) {
                    return res.status(200).send(Utility.formatResponse(200, { count: 0, rows: [] }));
                }
            }

            let query = supabase
                .from('product_ad')
                .select('*, product:product_id(id, name, price, discounted_price)', { count: 'exact' });

            if (userType === 'distributor' || userType === 'company') {
                query = query.in('product_id', productIds);
            }

            if (search) {
                query = query.or(`title.ilike.%${search}%,status.ilike.${search}%`);
            }

            const { data, count, error } = await query
                .order('updated_at', { ascending: false })
                .range(offset, offset + limit - 1);

            if (error) throw error;

            res.status(200).send(Utility.formatResponse(200, { count: count || 0, rows: data || [] }));
        } catch (err) {
            console.error("productAd getAll error:", err);
            res.status(500).send(Utility.formatResponse(500, err.message));
        }
    },

    /** Create a new product ad */
    create: async (req, res) => {
        try {
            const payload = { ...req.body, created_by: req.body.userId };
            delete payload.userId;
            if (payload.id === '' || payload.id === null || payload.id === undefined) {
                delete payload.id;
            }

            const { data, error } = await supabase
                .from('product_ad')
                .insert(payload)
                .select('id')
                .single();

            if (error) throw error;

            res.status(200).send(Utility.formatResponse(200, { id: data.id }));
        } catch (err) {
            console.error("create productAd error:", err);
            res.status(409).send(Utility.formatResponse(409, `Error creating product ad`));
        }
    },

    /** Update an existing product ad */
    update: async (req, res) => {
        try {
            const payload = { ...req.body, updated_by: req.body.userId, updated_at: new Date().toISOString() };
            const id = payload.id;
            delete payload.userId;
            delete payload.id;

            const { error } = await supabase
                .from('product_ad')
                .update(payload)
                .eq('id', id);

            if (error) throw error;

            res.status(200).send(Utility.formatResponse(200, `Updated Successfully`));
        } catch (err) {
            console.error("update productAd error:", err);
            res.status(500).send(Utility.formatResponse(500, err.message));
        }
    },

    /** Soft-delete a product ad (set to expired) */
    delete: async (req, res) => {
        try {
            const id = req.body.id;
            const payload = { status: 'expired', updated_by: req.body.userId, updated_at: new Date().toISOString() };

            const { error } = await supabase
                .from('product_ad')
                .update(payload)
                .eq('id', id);

            if (error) throw error;

            res.status(200).send(Utility.formatResponse(200, `Deleted Successfully`));
        } catch (err) {
            console.error("delete productAd error:", err);
            res.status(500).send(Utility.formatResponse(500, err.message));
        }
    },

    /** Track absolute clicks on an ad banner */
    trackClick: async (req, res) => {
        try {
            // Using RPC for incrementing
            const { error } = await supabase.rpc('increment_click_count', { row_id: req.params.id });

            if (error) throw error;

            res.status(200).send(Utility.formatResponse(200, `Click tracked`));
        } catch (err) {
            console.error("trackClick error:", err);
            res.status(500).send(Utility.formatResponse(500, err.message));
        }
    }
};

module.exports = productAdController;

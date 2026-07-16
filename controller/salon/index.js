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
                    // Include salons where this user is creator, referrer, or the linked user_id
                    query = query.or(`created_by.eq.${userId},referral_by.eq.${userId},user_id.eq.${userId}`);
                }
            }

            if (search) {
                query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,status.ilike.${search}%`);
            }

            const { data, error, count } = await query
                .order('updated_at', { ascending: false })
                .range(offset, offset + limit - 1);

            if (error) throw error;

            // Always return success with data (even empty list) so the frontend can render properly
            res.status(200).send(Utility.formatResponse(200, { count: count || 0, rows: data || [] }));
        } catch (err) {
            console.error("getSalons error:", err);
            res.status(500).send(Utility.formatResponse(500, err.message));
        }
    },

    /** Creating salon in the database */
    createSalon: async (req, res) => {
        try {
            const salonOwnerId = req.body.userId;
            const payload = { ...req.body, created_by: salonOwnerId };
            delete payload.userId;

            // Auto-set referral_by: look up who created this salon owner (i.e. the sales executive)
            if (!payload.referral_by) {
                const { data: ownerUser } = await supabase
                    .from('users')
                    .select('created_by')
                    .eq('id', salonOwnerId)
                    .single();

                if (ownerUser && ownerUser.created_by) {
                    payload.referral_by = ownerUser.created_by;
                }
            }

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
            const isFeatured = req.query.is_featured === 'true' ? true : req.query.is_featured === 'false' ? false : null;
            const isFranchise = req.query.is_franchise === 'true' ? true : req.query.is_franchise === 'false' ? false : null;
            const gender = req.query.gender || null;
            const cityId = req.query.city_id ? parseInt(req.query.city_id, 10) : null;
            const minRating = req.query.min_rating ? parseFloat(req.query.min_rating) : null;
            const latitude = req.query.latitude ? parseFloat(req.query.latitude) : null;
            const longitude = req.query.longitude ? parseFloat(req.query.longitude) : null;

            const data = await Utility.executeRpc('get_salon_list', {
                p_is_featured: isFeatured,
                p_is_franchise: isFranchise,
                p_gender: gender,
                p_city_id: cityId,
                p_min_rating: minRating,
                p_latitude: latitude,
                p_longitude: longitude
            });

            if (data && data.length > 0) {
                // Fetch front images for all salons in one query
                const salonIds = data.map(s => s.id);
                const { data: frontImages } = await supabase
                    .from('images')
                    .select('parent_id, image_src')
                    .eq('parent', 'salon')
                    .eq('type', 'front')
                    .in('parent_id', salonIds)
                    .order('created_at', { ascending: true });

                // Build lookup: salonId -> first front image_src
                const frontImageMap = {};
                if (frontImages) {
                    frontImages.forEach(img => {
                        if (!frontImageMap[img.parent_id]) {
                            frontImageMap[img.parent_id] = img.image_src;
                        }
                    });
                }

                const S3_BASE = 'https://salon-s3.s3.us-east-1.amazonaws.com';
                const enriched = data.map(salon => {
                    const img = frontImageMap[salon.id];
                    return {
                        ...salon,
                        front_image: img
                            ? (img.startsWith('http') ? img : `${S3_BASE}/eden-sign/salon/front/${img}`)
                            : salon.banner_image  // fallback to old banner
                    };
                });

                res.status(200).send(Utility.formatResponse(200, enriched));
            } else {
                res.status(404).send(Utility.formatResponse(404, `No Data Found`));
            }
        } catch (err) {
            console.error("getSalonList error:", err);
            res.status(500).send(Utility.formatResponse(500, err.message));
        }
    },

    /** Get the salons, their associated addresses & their images */
    getSalonDetail: async (req, res) => {
        try {
            const salonCode = req.body.code || req.params.id;

            // Get salon + address via RPC
            const rpcData = await Utility.executeRpc('get_salon_detail', { p_salon_code: salonCode });

            if (!rpcData || rpcData.length === 0) {
                return res.status(404).send(Utility.formatResponse(404, `No Data Found`));
            }

            // Build salon object from first row (RPC returns one row per image due to JOIN)
            const salonDetail = { salon: {}, images: [] };
            const salonRow = rpcData[0];
            salonDetail.salon = { ...salonRow };
            delete salonDetail.salon.image_src;

            // Fetch ALL images with their type separately from supabase
            const { data: imagesData, error: imgError } = await supabase
                .from('images')
                .select('id, type, image_src, priority')
                .eq('parent', 'salon')
                .eq('parent_id', salonRow.id)
                .order('priority', { ascending: false });

            if (!imgError && imagesData) {
                salonDetail.images = imagesData; // Full objects: [{type, image_src}, ...]
            }

            res.status(200).send(Utility.formatResponse(200, salonDetail));
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

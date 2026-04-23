/**
 * Copyright © 2026, Eden Sign Inc. ALL RIGHTS RESERVED.
 */

const supabase = require("../../supabase");
const Utility = require("../../utility");

const SalonInventoryController = {
    /** Get inventory with dashboard stats for a specific salon */
    getInventory: async (req, res) => {
        try {
            const { page, size, search, salonId } = req.query;
            const { limit, offset } = Utility.getPagination(parseInt(page), parseInt(size));

            let targetSalonId = salonId;

            if (!targetSalonId) {
                const { data: salon, error: err1 } = await supabase
                    .from('salon')
                    .select('id')
                    .eq('user_id', req.userId)
                    .single();

                if (err1 && err1.code !== 'PGRST116') throw err1;

                if (salon) {
                    targetSalonId = salon.id;
                } else {
                    return res.status(404).send(Utility.formatResponse(404, "Salon not found for this user"));
                }
            }

            let query = supabase
                .from('salon_inventory_product')
                .select('*', { count: 'exact' })
                .eq('salon_id', targetSalonId);

            if (search) {
                query = query.or(`name.ilike.%${search}%,brand.ilike.%${search}%,sku.ilike.%${search}%`);
            }

            const { data: rows, count, error: err2 } = await query
                .order('updated_at', { ascending: false })
                .range(offset, offset + limit - 1);

            if (err2) throw err2;

            const { data: allProducts, error: err3 } = await supabase
                .from('salon_inventory_product')
                .select('stock_quantity, low_stock_threshold')
                .eq('salon_id', targetSalonId);

            if (err3) throw err3;

            let stats = {
                totalProducts: allProducts.length,
                totalStock: 0,
                lowStock: 0
            };

            allProducts.forEach(p => {
                stats.totalStock += (p.stock_quantity || 0);
                if (p.stock_quantity <= p.low_stock_threshold) {
                    stats.lowStock += 1;
                }
            });

            return res.status(200).send(Utility.formatResponse(200, {
                list: { count: count || 0, rows: rows || [] },
                stats
            }));

        } catch (err) {
            console.error("Error fetching salon inventory:", err);
            return res.status(500).send(Utility.formatResponse(500, err.message));
        }
    },

    /** Create a new product for salon inventory */
    createProduct: async (req, res) => {
        try {
            const { name, brand, stock_quantity, low_stock_threshold, sku, salonId, usage_per_client } = req.body;

            let targetSalonId = salonId;

            if (!targetSalonId) {
                const { data: salon, error: err1 } = await supabase
                    .from('salon')
                    .select('id')
                    .eq('user_id', req.userId)
                    .single();

                if (err1 && err1.code !== 'PGRST116') throw err1;

                if (salon) {
                    targetSalonId = salon.id;
                } else {
                    return res.status(404).send(Utility.formatResponse(404, "Salon not found for this user. Cannot create product."));
                }
            }

            const { data: newProduct, error: err2 } = await supabase
                .from('salon_inventory_product')
                .insert({
                    salon_id: targetSalonId,
                    name,
                    brand,
                    stock_quantity: stock_quantity || 0,
                    low_stock_threshold: low_stock_threshold || 10,
                    usage_per_client: usage_per_client || 0,
                    sku,
                    created_by: req.userId,
                    status: 'active'
                })
                .select('*')
                .single();

            if (err2) throw err2;

            return res.status(200).send(Utility.formatResponse(200, newProduct));
        } catch (err) {
            console.error("Error creating salon product:", err);
            return res.status(500).send(Utility.formatResponse(500, err.message));
        }
    },

    /** Update stock or product details */
    updateProduct: async (req, res) => {
        try {
            const { id, name, brand, stock_quantity, low_stock_threshold, sku, status, usage_per_client } = req.body;

            const { data: product, error: err1 } = await supabase
                .from('salon_inventory_product')
                .select('id')
                .eq('id', id)
                .single();

            if (err1 && err1.code !== 'PGRST116') throw err1;

            if (!product) {
                return res.status(404).send(Utility.formatResponse(404, "Product not found"));
            }

            const { error: err2 } = await supabase
                .from('salon_inventory_product')
                .update({
                    name, brand, stock_quantity, low_stock_threshold, sku, status, usage_per_client,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id);

            if (err2) throw err2;

            return res.status(200).send(Utility.formatResponse(200, "Product updated successfully"));
        } catch (err) {
            console.error("Error updating salon product:", err);
            return res.status(500).send(Utility.formatResponse(500, err.message));
        }
    },

    /** Quick Stock Update */
    updateStock: async (req, res) => {
        try {
            const { id, stock_quantity } = req.body;

            const { error } = await supabase
                .from('salon_inventory_product')
                .update({
                    stock_quantity,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id);

            if (error) throw error;

            return res.status(200).send(Utility.formatResponse(200, "Stock updated successfully"));
        } catch (err) {
            console.error("Error updating stock:", err);
            return res.status(500).send(Utility.formatResponse(500, err.message));
        }
    }
};

module.exports = SalonInventoryController;

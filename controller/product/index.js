/**
 * Copyright © 2023, Eden Sign Inc. ALL RIGHTS RESERVED.
 */

const supabase = require("../../supabase");
const Utility = require("../../utility");

const productController = {
    /** Get products from database based on query type, page, size and search if provided */
    getProducts: async (req, res) => {
        try {
            const { page, size, search } = req.query;
            const { limit, offset } = Utility.getPagination(parseInt(page), parseInt(size));

            let query = supabase
                .from('product')
                .select('*', { count: 'exact' });

            if (search) {
                query = query.or(`name.ilike.%${search}%,brand.ilike.%${search}%,color.ilike.%${search}%,status.ilike.${search}%`);
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
            console.error("getProducts error:", err);
            res.status(500).send(Utility.formatResponse(500, err.message));
        }
    },

    /** Creating product in the database */
    createProduct: async (req, res) => {
        try {
            const payload = { ...req.body, created_by: req.body.userId };
            delete payload.userId;

            const { data, error } = await supabase
                .from('product')
                .insert(payload)
                .select('id')
                .single();

            if (error) throw error;

            res.status(200).send(Utility.formatResponse(200, { id: data.id }));
        } catch (err) {
            console.error("createProduct error:", err);
            res.status(409).send(Utility.formatResponse(409, err.message));
        }
    },

    /** Updating product in the database */
    updateProduct: async (req, res) => {
        try {
            const payload = { ...req.body, updated_by: req.body.userId, updated_at: new Date().toISOString() };
            const id = payload.id;
            delete payload.userId;
            delete payload.id;

            const { error } = await supabase
                .from('product')
                .update(payload)
                .eq('id', id);

            if (error) throw error;

            res.status(200).send(Utility.formatResponse(200, `Updated Successfully`));
        } catch (err) {
            console.error("updateProduct error:", err);
            res.status(500).send(Utility.formatResponse(500, err.message));
        }
    },

    /** API for the edensign website */
    getProductList: async (req, res) => {
        try {
            const { data, error } = await supabase
                .from('product')
                .select('id, name, brand, price, color, capacity, description, discount_percent, discounted_price, is_home, is_bestseller, status, product_image(image_src)')
                .eq('status', 'active'); // Assuming you want only active for the website

            if (error) throw error;

            if (data && data.length > 0) {
                res.status(200).send(Utility.formatResponse(200, data));
            } else {
                res.status(404).send(Utility.formatResponse(404, `No Data Found`));
            }
        } catch (err) {
            console.error("getProductList error:", err);
            res.status(500).send(Utility.formatResponse(500, err.message));
        }
    },

    /** Get inventory data - products with stock information */
    getInventory: async (req, res) => {
        try {
            const { page, size, search } = req.query;
            const { limit, offset } = Utility.getPagination(parseInt(page), parseInt(size));

            let query = supabase
                .from('product')
                .select('id, name, brand, sku, stock_quantity, low_stock_threshold, status, updated_at', { count: 'exact' });

            if (search) {
                query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%,brand.ilike.%${search}%`);
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
            console.error("getInventory error:", err);
            res.status(500).send(Utility.formatResponse(500, err.message));
        }
    },

    /** Update inventory stock for a product */
    updateInventory: async (req, res) => {
        try {
            const { id, stock_quantity, low_stock_threshold, sku } = req.body;
            const updateData = { updated_by: req.body.userId, updated_at: new Date().toISOString() };

            if (stock_quantity !== undefined) updateData.stock_quantity = stock_quantity;
            if (low_stock_threshold !== undefined) updateData.low_stock_threshold = low_stock_threshold;
            if (sku !== undefined) updateData.sku = sku;

            const { error } = await supabase
                .from('product')
                .update(updateData)
                .eq('id', id);

            if (error) throw error;

            res.status(200).send(Utility.formatResponse(200, `Inventory Updated Successfully`));
        } catch (err) {
            console.error("updateInventory error:", err);
            res.status(500).send(Utility.formatResponse(500, err.message));
        }
    }
};

module.exports = productController;

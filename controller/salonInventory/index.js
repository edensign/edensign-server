/**
 * Copyright © 2026, Eden Sign Inc. ALL RIGHTS RESERVED.
 */

const { Op } = require("sequelize");
const SalonInventoryProductModel = require("../../model/salonInventoryProduct");
const SalonModel = require("../../model/salon");
const Utility = require("../../utility");

const SalonInventoryController = {
    /** Get inventory with dashboard stats for a specific salon
     */
    getInventory: async (req, res) => {
        const { page, size, search, salonId } = req.query;
        const { limit, offset } = Utility.getPagination(parseInt(page), parseInt(size));

        let targetSalonId = salonId;

        try {
            // If salonId is not provided (e.g. Salon Owner logged in), find their salon
            if (!targetSalonId) {
                const salon = await SalonModel.findOne({ where: { user_id: req.userId } });
                if (salon) {
                    targetSalonId = salon.id;
                } else {
                    // If user is Admin, they might not have a salon, but if they didn't provide salonId, we can't show specific inventory.
                    // However, if the requirement is "Admins view ALL if no salonId provided", we'd skip filtering by salon_id.
                    // But stats calculation relies on a specific salon context usually.
                    // For now, let's assume this endpoint is for a specific salon's view.
                    return res.status(404).send(Utility.formatResponse(404, "Salon not found for this user"));
                }
            }

            let searchCond = {
                salon_id: targetSalonId
            };

            if (search) {
                searchCond = {
                    ...searchCond,
                    [Op.or]: [
                        { name: { [Op.like]: `%${search}%` } },
                        { brand: { [Op.like]: `%${search}%` } },
                        { sku: { [Op.like]: `%${search}%` } }
                    ]
                };
            }

            // Get List Data
            const { count, rows } = await SalonInventoryProductModel.findAndCountAll({
                limit, offset,
                where: searchCond,
                order: [["updated_at", "DESC"]]
            });

            // Get Stats (calculate based on all products for this salon)
            const allProducts = await SalonInventoryProductModel.findAll({
                where: { salon_id: targetSalonId },
                attributes: ['stock_quantity', 'low_stock_threshold']
            });

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
                list: { count, rows },
                stats
            }));

        } catch (err) {
            console.error("Error fetching salon inventory:", err);
            return res.status(500).send(Utility.formatResponse(500, err));
        }
    },

    /** Create a new product for salon inventory
     */
    createProduct: async (req, res) => {
        const { name, brand, stock_quantity, low_stock_threshold, sku, salonId, usage_per_client } = req.body;

        let targetSalonId = salonId;

        try {
            // If salonId is not provided, find the user's salon
            if (!targetSalonId) {
                const salon = await SalonModel.findOne({ where: { user_id: req.userId } });
                if (salon) {
                    targetSalonId = salon.id;
                } else {
                    return res.status(404).send(Utility.formatResponse(404, "Salon not found for this user. Cannot create product."));
                }
            }

            const newProduct = await SalonInventoryProductModel.create({
                salon_id: targetSalonId,
                name,
                brand,
                stock_quantity: stock_quantity || 0,
                low_stock_threshold: low_stock_threshold || 10,
                usage_per_client: usage_per_client || 0,
                sku,
                created_by: req.userId,
                status: 'active'
            });

            return res.status(200).send(Utility.formatResponse(200, newProduct));
        } catch (err) {
            console.error("Error creating salon product:", err);
            return res.status(500).send(Utility.formatResponse(500, err));
        }
    },

    /** Update stock or product details
     */
    updateProduct: async (req, res) => {
        const { id, name, brand, stock_quantity, low_stock_threshold, sku, status, usage_per_client } = req.body;
        const userId = req.userId;

        try {
            // Check existence
            const product = await SalonInventoryProductModel.findByPk(id);
            if (!product) {
                return res.status(404).send(Utility.formatResponse(404, "Product not found"));
            }

            // Optional: Check authorization (does this product belong to this user's salon?)
            // We could lookup the user's salon and compare, checking if (product.salon_id !== userSalon.id)

            await SalonInventoryProductModel.update(
                {
                    name, brand, stock_quantity, low_stock_threshold, sku, status, usage_per_client,
                    updated_at: new Date()
                },
                { where: { id } }
            );

            return res.status(200).send(Utility.formatResponse(200, "Product updated successfully"));
        } catch (err) {
            console.error("Error updating salon product:", err);
            return res.status(500).send(Utility.formatResponse(500, err));
        }
    },

    /** Quick Stock Update
     */
    updateStock: async (req, res) => {
        const { id, stock_quantity } = req.body;

        try {
            await SalonInventoryProductModel.update(
                {
                    stock_quantity,
                    updated_at: new Date()
                },
                { where: { id } }
            );

            return res.status(200).send(Utility.formatResponse(200, "Stock updated successfully"));
        } catch (err) {
            console.error("Error updating stock:", err);
            return res.status(500).send(Utility.formatResponse(500, err));
        }
    }
};

module.exports = SalonInventoryController;

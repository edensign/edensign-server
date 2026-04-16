/**
 * Copyright © 2023, Eden Sign Inc. ALL RIGHTS RESERVED.
 */

const OrderModel = require("../../model/order");
const OrderItemModel = require("../../model/orderItem");
const Utility = require("../../utility");

const orderController = {
    createOrder: async (req, res) => {
        try {
            const customerId = req.userId;
            const { total_amount, items } = req.body; // items = [{product_id, quantity, price}]

            if (!items || items.length === 0) {
                return res.status(400).json(Utility.formatResponse(400, "Cart is empty"));
            }

            const order = await OrderModel.create({
                customer_id: customerId,
                total_amount: total_amount,
                status: 'pending'
            });

            for (let item of items) {
                await OrderItemModel.create({
                    order_id: order.id,
                    product_id: item.product_id,
                    quantity: item.quantity,
                    price: item.price
                });
            }

            return res.status(200).json(Utility.formatResponse(200, { message: "Order created successfully", order }));
        } catch (error) {
            console.error("Create order error:", error);
            return res.status(500).json(Utility.formatResponse(500, "Internal server error"));
        }
    },

    getMyOrders: async (req, res) => {
        try {
            const customerId = req.userId;
            const orders = await OrderModel.findAll({
                where: { customer_id: customerId }
            });
            // Ideally we also include items, but sticking to basics for now
            return res.status(200).json(Utility.formatResponse(200, { orders }));
        } catch (error) {
            console.error("Get orders error:", error);
            return res.status(500).json(Utility.formatResponse(500, "Internal server error"));
        }
    }
};

module.exports = orderController;

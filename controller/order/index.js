/**
 * Copyright © 2023, Eden Sign Inc. ALL RIGHTS RESERVED.
 */

const supabase = require("../../supabase");
const Utility = require("../../utility");

const orderController = {
    createOrder: async (req, res) => {
        try {
            const customerId = req.userId;
            const { total_amount, items } = req.body; // items = [{product_id, quantity, price}]

            if (!items || items.length === 0) {
                return res.status(400).json(Utility.formatResponse(400, "Cart is empty"));
            }

            const { data: order, error: err1 } = await supabase
                .from('order_table')
                .insert({
                    customer_id: customerId,
                    total_amount: total_amount,
                    status: 'pending'
                })
                .select('*')
                .single();

            if (err1) throw err1;

            const orderItems = items.map(item => ({
                order_id: order.id,
                product_id: item.product_id,
                quantity: item.quantity,
                price: item.price
            }));

            const { error: err2 } = await supabase
                .from('order_item')
                .insert(orderItems);

            if (err2) throw err2;

            return res.status(200).json(Utility.formatResponse(200, { message: "Order created successfully", order }));
        } catch (error) {
            console.error("Create order error:", error);
            return res.status(500).json(Utility.formatResponse(500, "Internal server error"));
        }
    },

    getMyOrders: async (req, res) => {
        try {
            const customerId = req.userId;
            const { data: orders, error } = await supabase
                .from('order_table')
                .select('*')
                .eq('customer_id', customerId);
            
            if (error) throw error;
            
            return res.status(200).json(Utility.formatResponse(200, { orders: orders || [] }));
        } catch (error) {
            console.error("Get orders error:", error);
            return res.status(500).json(Utility.formatResponse(500, "Internal server error"));
        }
    }
};

module.exports = orderController;

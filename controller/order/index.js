/**
 * Copyright © 2023, Eden Sign Inc. ALL RIGHTS RESERVED.
 */

const supabase = require("../../supabase");
const Utility = require("../../utility");

const orderController = {
    createOrder: async (req, res) => {
        try {
            const customerId = req.userId;
            const { total_amount, items, useWallet } = req.body; // items = [{product_id, quantity, price}]

            if (!items || items.length === 0) {
                return res.status(400).json(Utility.formatResponse(400, "Cart is empty"));
            }

            let payableAmount = total_amount;
            let walletDeduction = 0;

            if (useWallet) {
                const { data: wallet } = await supabase
                    .from('wallet')
                    .select('balance')
                    .eq('user_id', customerId)
                    .single();

                if (wallet && wallet.balance > 0) {
                    if (wallet.balance >= total_amount) {
                        walletDeduction = total_amount;
                        payableAmount = 0;
                    } else {
                        walletDeduction = wallet.balance;
                        payableAmount = total_amount - wallet.balance;
                    }
                }
            }

            const { data: order, error: err1 } = await supabase
                .from('order')
                .insert({
                    customer_id: customerId,
                    total_amount: total_amount,
                    status: payableAmount > 0 ? 'payment_pending' : 'paid'
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

            // Handle full wallet payment
            if (payableAmount === 0 && walletDeduction > 0) {
                const { data: wallet } = await supabase.from('wallet').select('id, balance').eq('user_id', customerId).single();
                await supabase.from('wallet').update({ balance: wallet.balance - walletDeduction }).eq('id', wallet.id);
                
                await supabase.from('wallet_transactions').insert({
                    user_id: customerId,
                    type: 'debit',
                    amount: walletDeduction,
                    source: 'order_payment',
                    status: 'success',
                    description: `Paid for order ${order.id} entirely from wallet`
                });

                return res.status(200).json(Utility.formatResponse(200, { message: "Order created successfully", order, payment: { status: 'paid' } }));
            }

            // Handle partial or full Razorpay payment
            if (payableAmount > 0) {
                const RazorpayUtils = require('../../utility/razorpay');
                const receipt = `order_${order.id}_${Date.now()}`;
                const rpOrder = await RazorpayUtils.createOrder(payableAmount, receipt);

                // Create a pending wallet transaction if there is a wallet deduction
                if (walletDeduction > 0) {
                    await supabase.from('wallet_transactions').insert({
                        user_id: customerId,
                        type: 'debit',
                        amount: walletDeduction,
                        source: 'order_payment',
                        status: 'pending',
                        razorpay_order_id: rpOrder.id,
                        description: `Pending wallet deduction for order ${order.id}`
                    });
                }

                return res.status(200).json(Utility.formatResponse(200, {
                    message: "Payment required",
                    order,
                    payment: {
                        status: 'payment_pending',
                        razorpay_order: rpOrder,
                        walletDeduction,
                        payableAmount
                    }
                }));
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
            const { data: orders, error } = await supabase
                .from('order')
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

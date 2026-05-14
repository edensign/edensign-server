/**
 * Copyright © 2023, Eden Sign Inc. ALL RIGHTS RESERVED.
 */

const supabase = require("../../supabase");
const Utility = require("../../utility");
const RazorpayUtils = require("../../utility/razorpay");
const { sendPushNotification } = require("../../utility/notificationHelper");

const walletController = {
    /** Get user's wallet balance */
    getBalance: async (req, res) => {
        try {
            const userId = req.userId; // set by verifyToken middleware

            const { data, error } = await supabase
                .from('wallet')
                .select('balance')
                .eq('user_id', userId)
                .single();

            if (error && error.code !== 'PGRST116') {
                throw error;
            }

            const balance = data ? data.balance : 0.00;
            res.status(200).send(Utility.formatResponse(200, { balance }));
        } catch (err) {
            console.error('getBalance error:', err);
            res.status(500).send(Utility.formatResponse(500, err.message));
        }
    },

    /** Get user's wallet transactions */
    getTransactions: async (req, res) => {
        try {
            const userId = req.userId; // set by verifyToken middleware
            const { page, size } = req.query;
            
            let query = supabase
                .from('wallet_transactions')
                .select('*', { count: 'exact' })
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (page && size) {
                const { limit, offset } = Utility.getPagination(parseInt(page), parseInt(size));
                query = query.range(offset, offset + limit - 1);
            }

            const { data, error, count } = await query;

            if (error) throw error;

            res.status(200).send(Utility.formatResponse(200, { count, rows: data || [] }));
        } catch (err) {
            console.error('getTransactions error:', err);
            res.status(500).send(Utility.formatResponse(500, err.message));
        }
    },

    /** Create Razorpay order to add money to wallet */
    addMoney: async (req, res) => {
        try {
            const userId = req.userId; // set by verifyToken middleware
            const { amount } = req.body;

            if (!amount || amount <= 0) {
                return res.status(400).send(Utility.formatResponse(400, "Invalid amount"));
            }

            const receipt = `wallet_${userId}_${Date.now()}`;
            const order = await RazorpayUtils.createOrder(amount, receipt);

            // Log pending transaction
            const { error } = await supabase
                .from('wallet_transactions')
                .insert({
                    user_id: userId,
                    type: 'credit',
                    amount: amount,
                    source: 'razorpay_add_money',
                    status: 'pending',
                    razorpay_order_id: order.id,
                    description: `Added INR ${amount} to wallet`
                });

            if (error) throw error;

            res.status(200).send(Utility.formatResponse(200, order));
        } catch (err) {
            console.error('addMoney error:', err);
            res.status(500).send(Utility.formatResponse(500, err.message));
        }
    },

    /** Verify Razorpay payment and credit wallet */
    verifyAddMoney: async (req, res) => {
        try {
            const userId = req.userId; // set by verifyToken middleware
            const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

            if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
                return res.status(400).send(Utility.formatResponse(400, "Missing payment details"));
            }

            const isValid = RazorpayUtils.verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);

            if (!isValid) {
                // Update transaction to failed
                await supabase
                    .from('wallet_transactions')
                    .update({ status: 'failed', razorpay_payment_id })
                    .eq('razorpay_order_id', razorpay_order_id);
                    
                return res.status(400).send(Utility.formatResponse(400, "Invalid payment signature"));
            }

            // Get pending transaction
            const { data: transaction, error: txError } = await supabase
                .from('wallet_transactions')
                .select('*')
                .eq('razorpay_order_id', razorpay_order_id)
                .eq('user_id', userId)
                .single();

            if (txError || !transaction) {
                return res.status(404).send(Utility.formatResponse(404, "Transaction not found"));
            }

            if (transaction.status === 'success') {
                return res.status(200).send(Utility.formatResponse(200, "Payment already verified"));
            }

            // Update transaction to success
            const { error: updateTxError } = await supabase
                .from('wallet_transactions')
                .update({ status: 'success', razorpay_payment_id })
                .eq('id', transaction.id);

            if (updateTxError) throw updateTxError;

            // Credit wallet balance
            // Check if wallet exists
            const { data: wallet, error: walletError } = await supabase
                .from('wallet')
                .select('id, balance')
                .eq('user_id', userId)
                .single();

            if (walletError && walletError.code !== 'PGRST116') {
                throw walletError;
            }

            if (wallet) {
                // Update existing wallet
                const newBalance = parseFloat(wallet.balance) + parseFloat(transaction.amount);
                const { error: updateWalletError } = await supabase
                    .from('wallet')
                    .update({ balance: newBalance })
                    .eq('id', wallet.id);
                if (updateWalletError) throw updateWalletError;
            } else {
                // Create new wallet
                const { error: insertWalletError } = await supabase
                    .from('wallet')
                    .insert({
                        user_id: userId,
                        balance: transaction.amount
                    });
                if (insertWalletError) throw insertWalletError;
            }

            // Send notification asynchronously
            sendPushNotification(
                userId,
                "Wallet Credited",
                `Your wallet has been credited with INR ${transaction.amount}`,
                "wallet",
                { amount: transaction.amount, newBalance: newBalance || transaction.amount }
            );

            res.status(200).send(Utility.formatResponse(200, "Money added successfully"));
        } catch (err) {
            console.error('verifyAddMoney error:', err);
            res.status(500).send(Utility.formatResponse(500, err.message));
        }
    },

    /** Verify Razorpay payment for bookings/orders */
    verifyPayment: async (req, res) => {
        try {
            const userId = req.userId; // set by verifyToken middleware
            const { razorpay_order_id, razorpay_payment_id, razorpay_signature, type, reference_id } = req.body;

            if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
                return res.status(400).send(Utility.formatResponse(400, "Missing payment details"));
            }

            const isValid = RazorpayUtils.verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);

            if (!isValid) {
                // Update wallet transaction to failed if it exists
                await supabase
                    .from('wallet_transactions')
                    .update({ status: 'failed', razorpay_payment_id })
                    .eq('razorpay_order_id', razorpay_order_id);
                    
                return res.status(400).send(Utility.formatResponse(400, "Invalid payment signature"));
            }

            // Update wallet transaction to success
            const { data: transaction } = await supabase
                .from('wallet_transactions')
                .select('*')
                .eq('razorpay_order_id', razorpay_order_id)
                .single();

            if (transaction) {
                await supabase
                    .from('wallet_transactions')
                    .update({ status: 'success', razorpay_payment_id })
                    .eq('id', transaction.id);

                // Deduct from wallet since this was a partial payment
                if (transaction.amount > 0 && transaction.type === 'debit') {
                    const { data: wallet } = await supabase
                        .from('wallet')
                        .select('id, balance')
                        .eq('user_id', userId)
                        .single();
                        
                    if (wallet) {
                        const newBalance = parseFloat(wallet.balance) - parseFloat(transaction.amount);
                        await supabase
                            .from('wallet')
                            .update({ balance: newBalance })
                            .eq('id', wallet.id);
                    }
                }
            }

            // Update order/appointment status to paid
            if (type === 'order') {
                await supabase.from('order').update({ status: 'paid' }).eq('id', reference_id);
            } else if (type === 'appointment') {
                // Assuming you want to track payment status for appointments
                // If you add a status column to appointment table:
                // await supabase.from('appointment').update({ payment_status: 'paid' }).eq('id', reference_id);
            }

            res.status(200).send(Utility.formatResponse(200, "Payment verified successfully"));
        } catch (err) {
            console.error('verifyPayment error:', err);
            res.status(500).send(Utility.formatResponse(500, err.message));
        }
    },

    /**
     * Initiate payment for appointment BEFORE booking.
     * Creates a Razorpay order. After payment succeeds,
     * client calls /wallet/verify-appointment which creates the appointment.
     */
    initiateAppointmentPayment: async (req, res) => {
        try {
            const userId = req.userId;
            const { amount, useWallet, slot_info } = req.body; // slot_info is metadata to store temporarily

            if (!amount || parseFloat(amount) <= 0) {
                return res.status(400).send(Utility.formatResponse(400, 'Invalid amount'));
            }

            let payableAmount = parseFloat(amount);
            let walletDeduction = 0;

            if (useWallet) {
                const { data: wallet } = await supabase
                    .from('wallet')
                    .select('balance')
                    .eq('user_id', userId)
                    .single();

                if (wallet && wallet.balance > 0) {
                    if (wallet.balance >= payableAmount) {
                        walletDeduction = payableAmount;
                        payableAmount = 0;
                    } else {
                        walletDeduction = wallet.balance;
                        payableAmount -= wallet.balance;
                    }
                }
            }

            // If fully covered by wallet, no Razorpay order needed
            if (payableAmount === 0) {
                return res.status(200).send(Utility.formatResponse(200, {
                    payment: { status: 'wallet_only', walletDeduction }
                }));
            }

            const receipt = `appt_init_${userId}_${Date.now()}`;
            const rpOrder = await RazorpayUtils.createOrder(payableAmount, receipt);

            res.status(200).send(Utility.formatResponse(200, {
                payment: {
                    status: 'payment_pending',
                    razorpay_order: rpOrder,
                    walletDeduction,
                    payableAmount
                }
            }));
        } catch (err) {
            console.error('initiateAppointmentPayment error:', err);
            res.status(500).send(Utility.formatResponse(500, err.message));
        }
    },

    /**
     * After Razorpay payment success: verify payment then create the appointment.
     */
    verifyAndBookAppointment: async (req, res) => {
        try {
            const userId = req.userId;
            const {
                razorpay_order_id, razorpay_payment_id, razorpay_signature,
                walletDeduction,
                // Appointment data
                date, time_slot, services, salon_employee, booked_for
            } = req.body;

            // Verify signature
            const isValid = RazorpayUtils.verifySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
            if (!isValid) {
                return res.status(400).send(Utility.formatResponse(400, 'Invalid payment signature'));
            }

            // Check slot not already booked
            const searchDate = new Date(date);
            const startOfDay = new Date(new Date(date).setHours(0,0,0,0)).toISOString();
            const endOfDay   = new Date(new Date(date).setHours(23,59,59,999)).toISOString();

            const { data: existing } = await supabase
                .from('appointment')
                .select('id')
                .eq('salon_employee', salon_employee)
                .eq('time_slot', time_slot)
                .gte('date', startOfDay)
                .lte('date', endOfDay)
                .single();

            if (existing) {
                return res.status(409).send(Utility.formatResponse(409, 'Slot already booked'));
            }

            // Create the appointment
            const { data: appointment, error: apptErr } = await supabase
                .from('appointment')
                .insert({
                    date: new Date(date).toISOString(),
                    time_slot,
                    services: services || '',
                    salon_employee,
                    booked_for: booked_for || 'self',
                    customer_id: userId
                })
                .select('*')
                .single();

            if (apptErr) throw apptErr;

            // Deduct wallet if applicable
            if (walletDeduction && parseFloat(walletDeduction) > 0) {
                const { data: wallet } = await supabase.from('wallet').select('id, balance').eq('user_id', userId).single();
                if (wallet) {
                    const newBal = parseFloat(wallet.balance) - parseFloat(walletDeduction);
                    await supabase.from('wallet').update({ balance: newBal }).eq('id', wallet.id);
                    await supabase.from('wallet_transactions').insert({
                        user_id: userId,
                        type: 'debit',
                        amount: parseFloat(walletDeduction),
                        source: 'booking_payment',
                        status: 'success',
                        razorpay_order_id,
                        razorpay_payment_id,
                        description: `Payment for appointment ${appointment.id}`
                    });
                }
            } else {
                // Log full razorpay payment
                await supabase.from('wallet_transactions').insert({
                    user_id: userId,
                    type: 'debit',
                    amount: 0, // razorpay handled full amount
                    source: 'booking_payment',
                    status: 'success',
                    razorpay_order_id,
                    razorpay_payment_id,
                    description: `Razorpay payment for appointment ${appointment.id}`
                });
            }

            // Send push notification asynchronously
            sendPushNotification(
                userId,
                "Appointment Confirmed",
                `Your appointment for ${date.split('T')[0]} at ${time_slot} is confirmed.`,
                "appointment",
                { appointmentId: appointment.id }
            );

            res.status(200).send(Utility.formatResponse(200, { appointment, payment: { status: 'paid' } }));
        } catch (err) {
            console.error('verifyAndBookAppointment error:', err);
            res.status(500).send(Utility.formatResponse(500, err.message));
        }
    }
};

module.exports = walletController;

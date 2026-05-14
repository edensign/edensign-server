/**
 * Copyright © 2026, Eden Sign Inc. ALL RIGHTS RESERVED.
 */

const supabase = require("../../supabase");
const Utility = require("../../utility");
const { sendPushNotification } = require("../../utility/notificationHelper");

const AppointmentController = {
    /** Get booked slots for a specific employee and date */
    getBookedSlots: async (req, res) => {
        try {
            const { employee_id, date } = req.body;

            if (!employee_id || !date) {
                return res.status(400).send(Utility.formatResponse(400, "Missing employee_id or date"));
            }

            const searchDate = new Date(date);
            const startOfDay = new Date(searchDate.setHours(0, 0, 0, 0)).toISOString();
            const endOfDay = new Date(searchDate.setHours(23, 59, 59, 999)).toISOString();

            const { data, error } = await supabase
                .from('appointment')
                .select('time_slot')
                .eq('salon_employee', employee_id)
                .gte('date', startOfDay)
                .lte('date', endOfDay);

            if (error) throw error;

            const bookedSlots = data.map(a => a.time_slot);
            res.status(200).send(Utility.formatResponse(200, bookedSlots));

        } catch (err) {
            console.error("Error fetching booked slots:", err);
            res.status(500).send(Utility.formatResponse(500, err.message));
        }
    },

    /** Create a new appointment */
    createAppointment: async (req, res) => {
        try {
            const { date, time_slot, services, salon_employee, booked_for, customer_name, customer_contact } = req.body;

            if (!date || !time_slot || !salon_employee) {
                return res.status(400).send(Utility.formatResponse(400, "Missing required fields: date, time_slot, salon_employee"));
            }

            let customerId = req.userId;

            if (customer_contact && customer_name) {
                const { data: customer, error: err1 } = await supabase
                    .from('customer')
                    .select('id')
                    .eq('contact_no', customer_contact)
                    .single();

                if (err1 && err1.code !== 'PGRST116') throw err1;

                if (!customer) {
                    const randomPassword = Math.random().toString(36).slice(-8);
                    const hashedPassword = await Utility.createHash(randomPassword);

                    const { data: newCustomer, error: err2 } = await supabase
                        .from('customer')
                        .insert({
                            username: customer_name,
                            contact_no: customer_contact,
                            password: hashedPassword,
                            created_at: new Date().toISOString()
                        })
                        .select('id')
                        .single();

                    if (err2) throw err2;
                    customerId = newCustomer.id;
                } else {
                    customerId = customer.id;
                }
            }

            const searchDate = new Date(date);
            const startOfDay = new Date(searchDate.setHours(0, 0, 0, 0)).toISOString();
            const endOfDay = new Date(searchDate.setHours(23, 59, 59, 999)).toISOString();

            const { data: existingAppointment, error: err3 } = await supabase
                .from('appointment')
                .select('id')
                .eq('salon_employee', salon_employee)
                .eq('time_slot', time_slot)
                .gte('date', startOfDay)
                .lte('date', endOfDay)
                .single();

            if (err3 && err3.code !== 'PGRST116') throw err3;

            if (existingAppointment) {
                return res.status(409).send(Utility.formatResponse(409, "This slot is already booked"));
            }

            const { data: appointment, error: err4 } = await supabase
                .from('appointment')
                .insert({
                    date: new Date(date).toISOString(),
                    time_slot,
                    services: services || '',
                    salon_employee,
                    booked_for: booked_for || 'self',
                    customer_id: customerId,
                    // Note: If you add an amount/status column to appointment later, it goes here
                })
                .select('*')
                .single();

            if (err4) throw err4;

            // Send push notification asynchronously
            sendPushNotification(
                customerId,
                "Appointment Booked",
                `Your appointment for ${date.split('T')[0]} at ${time_slot} has been successfully initiated.`,
                "appointment",
                { appointmentId: appointment.id }
            );

            const { amount, useWallet } = req.body;
            let payableAmount = amount ? parseFloat(amount) : 0;
            let walletDeduction = 0;

            if (payableAmount > 0 && useWallet) {
                const { data: wallet } = await supabase
                    .from('wallet')
                    .select('balance')
                    .eq('user_id', customerId)
                    .single();

                if (wallet && wallet.balance > 0) {
                    if (wallet.balance >= payableAmount) {
                        walletDeduction = payableAmount;
                        payableAmount = 0;
                    } else {
                        walletDeduction = wallet.balance;
                        payableAmount = payableAmount - wallet.balance;
                    }
                }
            }

            // Handle full wallet payment
            if (payableAmount === 0 && walletDeduction > 0) {
                const { data: wallet } = await supabase.from('wallet').select('id, balance').eq('user_id', customerId).single();
                await supabase.from('wallet').update({ balance: wallet.balance - walletDeduction }).eq('id', wallet.id);
                
                await supabase.from('wallet_transactions').insert({
                    user_id: customerId,
                    type: 'debit',
                    amount: walletDeduction,
                    source: 'booking_payment',
                    status: 'success',
                    description: `Paid for appointment ${appointment.id} entirely from wallet`
                });

                return res.status(200).send(Utility.formatResponse(200, { appointment, payment: { status: 'paid' } }));
            }

            // Handle partial or full Razorpay payment
            if (payableAmount > 0) {
                const RazorpayUtils = require('../../utility/razorpay');
                const receipt = `appt_${appointment.id}_${Date.now()}`;
                const rpOrder = await RazorpayUtils.createOrder(payableAmount, receipt);

                // Create a pending wallet transaction if there is a wallet deduction
                if (walletDeduction > 0) {
                    await supabase.from('wallet_transactions').insert({
                        user_id: customerId,
                        type: 'debit',
                        amount: walletDeduction,
                        source: 'booking_payment',
                        status: 'pending',
                        razorpay_order_id: rpOrder.id,
                        description: `Pending wallet deduction for appointment ${appointment.id}`
                    });
                }

                return res.status(200).send(Utility.formatResponse(200, {
                    appointment,
                    payment: {
                        status: 'payment_pending',
                        razorpay_order: rpOrder,
                        walletDeduction,
                        payableAmount
                    }
                }));
            }

            return res.status(200).send(Utility.formatResponse(200, appointment));

        } catch (err) {
            console.error("Error creating appointment:", err);
            return res.status(500).send(Utility.formatResponse(500, err.message));
        }
    },

    /** Get all appointments with salon and employee details */
    getAppointments: async (req, res) => {
        try {
            const salonId = req.query.salonId ? parseInt(req.query.salonId) : null;
            
            const data = await Utility.executeRpc('get_appointments', { p_salon_id: salonId });

            return res.status(200).send(Utility.formatResponse(200, {
                rows: data || [],
                count: data ? data.length : 0
            }));

        } catch (err) {
            console.error("Error fetching appointments:", err);
            return res.status(500).send(Utility.formatResponse(500, err.message));
        }
    },

    /** Get Kanban slots: all stylists for a salon on a given date with their appointments */
    getKanbanSlots: async (req, res) => {
        try {
            const { date, salonId } = req.query;

            if (!date || !salonId) {
                return res.status(400).send(Utility.formatResponse(400, "Missing required query params: date, salonId"));
            }

            // Fetch salon details for opening/closing hours
            const { data: salon, error: err1 } = await supabase
                .from('salon')
                .select('opening_time, closing_time, closed_on')
                .eq('id', salonId)
                .single();

            if (err1 && err1.code !== 'PGRST116') throw err1;

            const salonHours = salon ? {
                opening_time: salon.opening_time,
                closing_time: salon.closing_time,
                closed_on: salon.closed_on
            } : null;

            // Fetch all stylists for this salon
            const { data: stylists, error: err2 } = await supabase
                .from('salon_employee')
                .select('id, name, services, contact_no')
                .eq('salon_id', salonId);

            if (err2) throw err2;

            if (!stylists || stylists.length === 0) {
                return res.status(200).send(Utility.formatResponse(200, {
                    stylists: [],
                    appointments: [],
                    salonHours
                }));
            }

            const stylistIds = stylists.map(s => s.id);

            // Fetch appointments using RPC
            const appointments = await Utility.executeRpc('get_kanban_appointments', {
                p_stylist_ids: stylistIds,
                p_date: date
            });

            return res.status(200).send(Utility.formatResponse(200, {
                stylists,
                appointments: appointments || [],
                salonHours
            }));

        } catch (err) {
            console.error("Error fetching kanban slots:", err);
            return res.status(500).send(Utility.formatResponse(500, err.message));
        }
    },

    /** Get appointments for the logged-in customer */
    getCustomerAppointments: async (req, res) => {
        try {
            const customerId = req.userId;
            const { data, error } = await supabase
                .from('appointment')
                .select(`
                    *,
                    salon_employee:salon_employee (
                        name,
                        salon:salon_id (id, name, email)
                    )
                `)
                .eq('customer_id', customerId)
                .order('date', { ascending: false });

            if (error) throw error;

            res.status(200).send(Utility.formatResponse(200, {
                rows: data || [],
                count: data ? data.length : 0
            }));
        } catch (err) {
            console.error("Error fetching customer appointments:", err);
            res.status(500).send(Utility.formatResponse(500, err.message));
        }
    }
};

module.exports = AppointmentController;

/**
 * Copyright © 2023, Eden Sign Inc. ALL RIGHTS RESERVED.
 */

const supabase = require("../../supabase");
const Utility = require("../../utility");

const customerController = {

    /** Register a new customer */
    register: async (req, res) => {
        try {
            console.log("Customer registration request received:", JSON.stringify(req.body, null, 2));
            const { username, password, contact_no, email } = req.body;

            if (!username || !password || !contact_no) {
                return res.status(400).json(Utility.formatResponse(400, "Username, password, and contact number are required"));
            }

            let query = supabase.from('customer').select('id, username, contact_no, email');
            if (email) {
                query = query.or(`contact_no.eq.${contact_no},email.eq.${email},username.eq.${username}`);
            } else {
                query = query.or(`contact_no.eq.${contact_no},username.eq.${username}`);
            }

            const { data: existingCustomers, error: err1 } = await query;
            if (err1) throw err1;

            if (existingCustomers && existingCustomers.length > 0) {
                const dup = existingCustomers[0];
                let dupMsg = "Customer with these credentials already exists.";
                if (dup.username && dup.username.toLowerCase() === username.toLowerCase()) {
                    dupMsg = "Name is already in use. Please use a different name.";
                } else if (dup.contact_no === contact_no) {
                    dupMsg = "Contact number is already registered. Please use a different number.";
                } else if (email && dup.email && dup.email.toLowerCase() === email.toLowerCase()) {
                    dupMsg = "Email is already registered. Please use a different email.";
                }
                return res.status(409).json(Utility.formatResponse(409, dupMsg));
            }

            const hashedPassword = await Utility.createHash(password);

            const { data: customer, error: err2 } = await supabase
                .from('customer')
                .insert({
                    username,
                    password: hashedPassword,
                    contact_no,
                    email: email || null,
                    created_at: new Date().toISOString()
                })
                .select('id, username, contact_no, email')
                .single();

            if (err2) throw err2;

            const token = Utility.getSignedToken(customer.id);

            return res.status(200).json(Utility.formatResponse(200, {
                message: "Registration successful",
                customer: {
                    id: customer.id,
                    username: customer.username,
                    contact_no: customer.contact_no,
                    email: customer.email
                },
                token
            }));

        } catch (error) {
            console.error("Customer registration error:", error);
            return res.status(500).json(Utility.formatResponse(500, error.message || "Internal server error"));
        }
    },

    /** Login customer */
    login: async (req, res) => {
        try {
            const { contact_no, email, password } = req.body;

            if ((!contact_no && !email) || !password) {
                return res.status(400).json(Utility.formatResponse(400, "Contact number or email and password are required"));
            }

            let query = supabase.from('customer').select('*');
            if (contact_no) {
                query = query.eq('contact_no', contact_no);
            } else {
                query = query.eq('email', email);
            }

            const { data: customer, error: err1 } = await query.single();
            if (err1 && err1.code !== 'PGRST116') throw err1;

            if (!customer) {
                return res.status(404).json(Utility.formatResponse(404, "Customer not found"));
            }

            const isMatch = await Utility.comparePassword(password, customer.password);

            if (!isMatch) {
                return res.status(401).json(Utility.formatResponse(401, "Invalid password"));
            }

            const token = Utility.getSignedToken(customer.id);

            return res.status(200).json(Utility.formatResponse(200, {
                message: "Login successful",
                customer: {
                    id: customer.id,
                    username: customer.username,
                    contact_no: customer.contact_no,
                    email: customer.email
                },
                token
            }));

        } catch (error) {
            console.error("Login error:", error);
            return res.status(500).json(Utility.formatResponse(500, "Internal server error"));
        }
    },

    /** Get customer profile (requires token) */
    getProfile: async (req, res) => {
        try {
            const customerId = req.userId;

            const { data: customer, error } = await supabase
                .from('customer')
                .select('id, username, contact_no, email, created_at')
                .eq('id', customerId)
                .single();
            
            if (error && error.code !== 'PGRST116') throw error;

            if (!customer) {
                return res.status(404).json(Utility.formatResponse(404, "Customer not found"));
            }

            return res.status(200).json(Utility.formatResponse(200, customer));

        } catch (error) {
            console.error("Get profile error:", error);
            return res.status(500).json(Utility.formatResponse(500, "Internal server error"));
        }
    }
};

module.exports = customerController;

/**
 * Copyright © 2023, Eden Sign Inc. ALL RIGHTS RESERVED.
 */

const supabase = require("../../supabase");
const Utility = require("../../utility");

const authController = {
    /** Register a new customer via mobile app */
    register: async (req, res) => {
        try {
            console.log("Registration request received with body:", JSON.stringify(req.body, null, 2));
            const { name, email, phone, password } = req.body;

            if (!name || !phone || !password) {
                return res.status(400).json(Utility.formatResponse(400, "Name, phone number, and password are required"));
            }

            let query = supabase.from('customer').select('id');
            if (email) {
                query = query.or(`contact_no.eq.${phone},email.eq.${email}`);
            } else {
                query = query.eq('contact_no', phone);
            }

            const { data: existingCustomer, error: err1 } = await query;
            if (err1) throw err1;

            if (existingCustomer && existingCustomer.length > 0) {
                return res.status(409).json(Utility.formatResponse(409, "Customer with this phone number or email already exists"));
            }

            const hashedPassword = await Utility.createHash(password);

            const { data: customer, error: err2 } = await supabase
                .from('customer')
                .insert({
                    username: name,
                    password: hashedPassword,
                    contact_no: phone,
                    email: email || null,
                    created_at: new Date().toISOString()
                })
                .select('id, username, contact_no, email')
                .single();

            if (err2) throw err2;

            const token = Utility.getSignedToken(customer.id);

            return res.status(200).json(Utility.formatResponse(200, {
                message: "Registration successful",
                user: {
                    id: customer.id,
                    name: customer.username,
                    phone: customer.contact_no,
                    email: customer.email
                },
                token
            }));

        } catch (error) {
            console.error("Registration error encountered:", error);
            return res.status(500).json(Utility.formatResponse(500, error.message || "Internal server error"));
        }
    },

    /** Login customer via mobile app */
    login: async (req, res) => {
        try {
            const { identifier, password } = req.body;

            if (!identifier || !password) {
                return res.status(400).json(Utility.formatResponse(400, "Identifier (Email or Phone) and password are required"));
            }

            const isEmail = identifier.includes("@");

            const { data: customer, error: err1 } = await supabase
                .from('customer')
                .select('*')
                .eq(isEmail ? 'email' : 'contact_no', identifier)
                .single();

            if (err1 && err1.code !== 'PGRST116') throw err1; // Ignore No Rows Found

            if (!customer) {
                return res.status(404).json(Utility.formatResponse(404, "Invalid credentials"));
            }

            const isMatch = await Utility.comparePassword(password, customer.password);

            if (!isMatch) {
                return res.status(401).json(Utility.formatResponse(401, "Invalid password"));
            }

            const token = Utility.getSignedToken(customer.id);

            return res.status(200).json(Utility.formatResponse(200, {
                message: "Login successful",
                user: {
                    id: customer.id,
                    name: customer.username,
                    phone: customer.contact_no,
                    email: customer.email
                },
                token
            }));

        } catch (error) {
            console.error("Login error:", error);
            return res.status(500).json(Utility.formatResponse(500, "Internal server error"));
        }
    },

    /** Update customer profile via mobile app */
    updateProfile: async (req, res) => {
        try {
            const customerId = req.userId;
            const { name, email } = req.body;

            const updateData = {};
            if (name) updateData.username = name;
            if (email) updateData.email = email;

            if (Object.keys(updateData).length === 0) {
                return res.status(200).json(Utility.formatResponse(200, "No data to update"));
            }

            const { data: customer, error } = await supabase
                .from('customer')
                .update(updateData)
                .eq('id', customerId)
                .select('id, username, contact_no, email')
                .single();

            if (error) throw error;

            if (!customer) {
                return res.status(404).json(Utility.formatResponse(404, "User not found"));
            }

            return res.status(200).json(Utility.formatResponse(200, {
                message: "Profile updated successfully",
                user: {
                    id: customer.id,
                    name: customer.username,
                    phone: customer.contact_no,
                    email: customer.email
                }
            }));
        } catch (error) {
            console.error("Update profile error:", error);
            return res.status(500).json(Utility.formatResponse(500, "Internal server error"));
        }
    }
};

module.exports = authController;

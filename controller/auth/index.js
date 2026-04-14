/**
 * Copyright © 2023, Eden Sign Inc. ALL RIGHTS RESERVED.
 */

const CustomerModel = require("../../model/customer");
const Utility = require("../../utility");
const { Op } = require("sequelize");

const authController = {
    /**
     * Register a new customer via mobile app
     * @param {Object} req - Request object with name, email, phone, password
     * @param {Object} res - Response object
     */
    register: async (req, res) => {
        try {
            console.log("Registration request received with body:", JSON.stringify(req.body, null, 2));
            const { name, email, phone, password } = req.body;

            if (!name || !phone || !password) {
                return res.status(400).json(
                    Utility.formatResponse(400, "Name, phone number, and password are required")
                );
            }

            const existingCustomer = await CustomerModel.findOne({
                where: {
                    [Op.or]: [
                        { contact_no: phone },
                        ...(email ? [{ email: email }] : [])
                    ]
                }
            });

            if (existingCustomer) {
                return res.status(409).json(
                    Utility.formatResponse(409, "Customer with this phone number or email already exists")
                );
            }

            const hashedPassword = await Utility.createHash(password);

            const customer = await CustomerModel.create({
                username: name,
                password: hashedPassword,
                contact_no: phone,
                email: email || null,
                created_at: new Date()
            });

            const token = Utility.getSignedToken(customer.id);

            return res.status(200).json(
                Utility.formatResponse(200, {
                    message: "Registration successful",
                    user: {
                        id: customer.id,
                        name: customer.username,
                        phone: customer.contact_no,
                        email: customer.email
                    },
                    token
                })
            );

        } catch (error) {
            console.error("Registration error encountered:", error);
            return res.status(500).json(
                Utility.formatResponse(500, error.message || "Internal server error")
            );
        }
    },

    /**
     * Login customer via mobile app
     * @param {Object} req - Request object with identifier, password
     * @param {Object} res - Response object
     */
    login: async (req, res) => {
        try {
            const { identifier, password } = req.body;

            if (!identifier || !password) {
                return res.status(400).json(
                    Utility.formatResponse(400, "Identifier (Email or Phone) and password are required")
                );
            }

            // Identify whether it is an email or phone number
            const isEmail = identifier.includes("@");

            const customer = await CustomerModel.findOne({
                where: isEmail ? { email: identifier } : { contact_no: identifier }
            });

            if (!customer) {
                return res.status(404).json(
                    Utility.formatResponse(404, "Invalid credentials")
                );
            }

            const isMatch = await Utility.comparePassword(password, customer.password);

            if (!isMatch) {
                return res.status(401).json(
                    Utility.formatResponse(401, "Invalid password")
                );
            }

            const token = Utility.getSignedToken(customer.id);

            return res.status(200).json(
                Utility.formatResponse(200, {
                    message: "Login successful",
                    user: {
                        id: customer.id,
                        name: customer.username,
                        phone: customer.contact_no,
                        email: customer.email
                    },
                    token
                })
            );

        } catch (error) {
            console.error("Login error:", error);
            return res.status(500).json(
                Utility.formatResponse(500, "Internal server error")
            );
        }
    },

    /**
     * Update customer profile via mobile app
     * @param {Object} req - Request object with name, email
     * @param {Object} res - Response object
     */
    updateProfile: async (req, res) => {
        try {
            const customerId = req.userId;
            const { name, email } = req.body;

            const customer = await CustomerModel.findByPk(customerId);
            if (!customer) {
                return res.status(404).json(Utility.formatResponse(404, "User not found"));
            }

            if (name) customer.username = name;
            if (email) customer.email = email;

            await customer.save();

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

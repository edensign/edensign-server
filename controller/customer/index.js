/**
 * Copyright © 2023, Eden Sign Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of Eden Sign Inc., and is licensed as
 * restricted rights software. The use, reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with Eden Sign.
 */

const CustomerModel = require("../../model/customer");
const Utility = require("../../utility");

const customerController = {

    /**
     * Register a new customer
     * @param {Object} req - Request object with username, password, contact_no, email
     * @param {Object} res - Response object
     */
    register: async (req, res) => {
        try {
            const { username, password, contact_no, email } = req.body;

            // Validation
            if (!username || !password || !contact_no) {
                return res.status(400).json(
                    Utility.formatResponse(400, "Username, password, and contact number are required")
                );
            }

            // Check if customer already exists with same contact_no or email
            const existingCustomer = await CustomerModel.findOne({
                where: {
                    [require("sequelize").Op.or]: [
                        { contact_no: contact_no },
                        ...(email ? [{ email: email }] : [])
                    ]
                }
            });

            if (existingCustomer) {
                return res.status(409).json(
                    Utility.formatResponse(409, "Customer with this contact number or email already exists")
                );
            }

            // Hash password
            const hashedPassword = await Utility.createHash(password);

            // Create customer
            const customer = await CustomerModel.create({
                username,
                password: hashedPassword,
                contact_no,
                email: email || null,
                created_at: new Date()
            });

            // Generate token
            const token = Utility.getSignedToken(customer.id);

            return res.status(200).json(
                Utility.formatResponse(200, {
                    message: "Registration successful",
                    customer: {
                        id: customer.id,
                        username: customer.username,
                        contact_no: customer.contact_no,
                        email: customer.email
                    },
                    token
                })
            );

        } catch (error) {
            console.error("Registration error:", error);
            return res.status(500).json(
                Utility.formatResponse(500, "Internal server error")
            );
        }
    },

    /**
     * Login customer
     * @param {Object} req - Request object with contact_no/email and password
     * @param {Object} res - Response object
     */
    login: async (req, res) => {
        try {
            const { contact_no, email, password } = req.body;

            // Validation
            if ((!contact_no && !email) || !password) {
                return res.status(400).json(
                    Utility.formatResponse(400, "Contact number or email and password are required")
                );
            }

            // Find customer
            const customer = await CustomerModel.findOne({
                where: contact_no ? { contact_no } : { email }
            });

            if (!customer) {
                return res.status(404).json(
                    Utility.formatResponse(404, "Customer not found")
                );
            }

            // Compare password
            const isMatch = await Utility.comparePassword(password, customer.password);

            if (!isMatch) {
                return res.status(401).json(
                    Utility.formatResponse(401, "Invalid password")
                );
            }

            // Generate token
            const token = Utility.getSignedToken(customer.id);

            return res.status(200).json(
                Utility.formatResponse(200, {
                    message: "Login successful",
                    customer: {
                        id: customer.id,
                        username: customer.username,
                        contact_no: customer.contact_no,
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
     * Get customer profile (requires token)
     * @param {Object} req - Request object with customer id from token
     * @param {Object} res - Response object
     */
    getProfile: async (req, res) => {
        try {
            const customerId = req.userId;

            const customer = await CustomerModel.findByPk(customerId, {
                attributes: ['id', 'username', 'contact_no', 'email', 'created_at']
            });

            if (!customer) {
                return res.status(404).json(
                    Utility.formatResponse(404, "Customer not found")
                );
            }

            return res.status(200).json(
                Utility.formatResponse(200, customer)
            );

        } catch (error) {
            console.error("Get profile error:", error);
            return res.status(500).json(
                Utility.formatResponse(500, "Internal server error")
            );
        }
    }
};

module.exports = customerController;

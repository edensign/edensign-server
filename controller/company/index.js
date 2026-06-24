/**
 * Copyright © 2026, Eden Sign Inc. ALL RIGHTS RESERVED.
 */

const supabase = require("../../supabase");
const Utility = require("../../utility");

const companyController = {
    /** Get companies from database with pagination and search */
    getCompanies: async (req, res) => {
        try {
            const { page, size, search, category_id } = req.query;
            const { limit, offset } = Utility.getPagination(parseInt(page), parseInt(size));

            let query = supabase
                .from('company')
                .select('*, category(name)', { count: 'exact' });

            if (category_id) {
                query = query.eq('category_id', category_id);
            }

            if (search) {
                query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
            }

            const { data, count, error } = await query
                .order('updated_at', { ascending: false })
                .range(offset, offset + limit - 1);

            if (error) throw error;

            if (count > 0) {
                res.status(200).send(Utility.formatResponse(200, { count, rows: data }));
            } else {
                res.status(404).send(Utility.formatResponse(404, 'No Data Found'));
            }
        } catch (err) {
            console.error('getCompanies error:', err);
            res.status(500).send(Utility.formatResponse(500, err.message));
        }
    },

    /** Create a new Company role and profile (Admin action) */
    createCompany: async (req, res) => {
        console.log("Company creation request received:", JSON.stringify(req.body, null, 2));
        const { username, password, email, contact_no, name, category_id, address, description } = req.body;

        if (!username || !password || !email || !contact_no || !name || !category_id) {
            return res.status(400).send(Utility.formatResponse(400, "All fields are required"));
        }

        try {
            // Check if email already exists
            const { data: existingUser, error: checkError } = await supabase
                .from('users')
                .select('id')
                .eq('email', email)
                .limit(1);

            if (checkError) throw checkError;
            if (existingUser && existingUser.length > 0) {
                return res.status(409).send(Utility.formatResponse(409, "Email is already registered. Please use a different email."));
            }

            // 1. Create the user credentials
            const hash = await Utility.createHash(password);
            const userPayload = {
                username,
                password: hash,
                email,
                contact_no,
                type: 'company',
                status: 'active',
                created_by: req.body.userId,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            const { data: userData, error: userError } = await supabase
                .from('users')
                .insert(userPayload)
                .select('id')
                .single();

            if (userError) throw userError;

            // 2. Create the company profile linked to the user
            const companyPayload = {
                user_id: userData.id,
                name,
                category_id,
                email,
                contact_no,
                address,
                description,
                status: 'active',
                created_by: req.body.userId,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            const { data: companyData, error: companyError } = await supabase
                .from('company')
                .insert(companyPayload)
                .select('id')
                .single();

            if (companyError) {
                // Rollback user creation
                await supabase.from('users').delete().eq('id', userData.id);
                throw companyError;
            }

            res.status(200).send(Utility.formatResponse(200, { id: companyData.id }));
        } catch (err) {
            console.error("Company creation error:", err);
            res.status(409).send(Utility.formatResponse(409, err.message || "Error creating company"));
        }
    },

    /** Get logged-in company profile details */
    getCompanyProfile: async (req, res) => {
        try {
            const { data, error } = await supabase
                .from('company')
                .select('*, category(name)')
                .eq('user_id', req.body.userId)
                .single();

            if (error || !data) {
                return res.status(404).send(Utility.formatResponse(404, 'Company Profile Not Found'));
            }
            res.status(200).send(Utility.formatResponse(200, data));
        } catch (err) {
            res.status(500).send(Utility.formatResponse(500, err.message));
        }
    },

    /** Update company details */
    updateCompany: async (req, res) => {
        try {
            const payload = { ...req.body, updated_by: req.body.userId, updated_at: new Date().toISOString() };
            const id = payload.id;
            delete payload.userId;
            delete payload.id;

            // Retrieve company user_id
            const { data: compData, error: fetchError } = await supabase
                .from('company')
                .select('user_id')
                .eq('id', id)
                .single();

            if (fetchError) throw fetchError;

            // Update credentials if modified
            const userUpdates = {};
            if (payload.username) userUpdates.username = payload.username;
            if (payload.email) userUpdates.email = payload.email;
            if (payload.contact_no) userUpdates.contact_no = payload.contact_no;
            if (payload.password) {
                userUpdates.password = await Utility.createHash(payload.password);
            }

            if (Object.keys(userUpdates).length > 0) {
                userUpdates.updated_by = req.body.userId;
                userUpdates.updated_at = new Date().toISOString();
                const { error: userError } = await supabase
                    .from('users')
                    .update(userUpdates)
                    .eq('id', compData.user_id);
                if (userError) throw userError;
            }

            // Clean up updates for company table
            const companyUpdates = {
                name: payload.name,
                category_id: payload.category_id,
                email: payload.email,
                contact_no: payload.contact_no,
                address: payload.address,
                description: payload.description,
                status: payload.status,
                pricing_info: payload.pricing_info,
                offer_info: payload.offer_info,
                updated_by: req.body.userId,
                updated_at: new Date().toISOString()
            };

            // Remove undefined fields
            Object.keys(companyUpdates).forEach(key => companyUpdates[key] === undefined && delete companyUpdates[key]);

            const { error: compError } = await supabase
                .from('company')
                .update(companyUpdates)
                .eq('id', id);

            if (compError) throw compError;

            res.status(200).send(Utility.formatResponse(200, 'Updated Successfully'));
        } catch (err) {
            console.error("updateCompany error:", err);
            res.status(500).send(Utility.formatResponse(500, err.message));
        }
    },

    /** Bulk update company products pricing and offers */
    updateCompanyPricingOffers: async (req, res) => {
        try {
            const { products } = req.body; // Array of { id, price, discounted_price, discount_percent }
            if (!Array.isArray(products)) {
                return res.status(400).send(Utility.formatResponse(400, 'Invalid products array'));
            }

            for (const prod of products) {
                const { id, price, discounted_price, discount_percent } = prod;
                const { error } = await supabase
                    .from('product')
                    .update({
                        price,
                        discounted_price,
                        discount_percent,
                        updated_at: new Date().toISOString(),
                        updated_by: req.body.userId
                    })
                    .eq('id', id);

                if (error) throw error;
            }

            res.status(200).send(Utility.formatResponse(200, 'Pricing and Offers updated successfully'));
        } catch (err) {
            console.error('updateCompanyPricingOffers error:', err);
            res.status(500).send(Utility.formatResponse(500, err.message));
        }
    }
};

module.exports = companyController;

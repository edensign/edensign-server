/**
 * Copyright © 2026, Eden Sign Inc. ALL RIGHTS RESERVED.
 */

const supabase = require("../../supabase");
const Utility = require("../../utility");

const distributorController = {
    /** Get distributors allotted to a specific company (Company action) */
    getCompanyDistributors: async (req, res) => {
        try {
            const { page, size, search } = req.query;
            const { limit, offset } = Utility.getPagination(parseInt(page), parseInt(size));

            // 1. Find the company profile belonging to this logged-in user
            const { data: companyRecord, error: compErr } = await supabase
                .from('company')
                .select('id')
                .eq('user_id', req.body.userId)
                .single();

            if (compErr || !companyRecord) {
                return res.status(404).send(Utility.formatResponse(404, 'Company profile not found for logged-in user'));
            }

            let query = supabase
                .from('distributor')
                .select('*, company(name)', { count: 'exact' })
                .eq('company_id', companyRecord.id);

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
            console.error('getCompanyDistributors error:', err);
            res.status(500).send(Utility.formatResponse(500, err.message));
        }
    },

    /** Create a new distributor (Company action) */
    createDistributor: async (req, res) => {
        console.log("Distributor creation request received:", JSON.stringify(req.body, null, 2));
        const { username, password, email, contact_no, name, address } = req.body;

        if (!username || !password || !email || !contact_no || !name) {
            return res.status(400).send(Utility.formatResponse(400, "All fields are required"));
        }

        try {
            // Find company profile belonging to this logged-in company user
            const { data: companyRecord, error: compErr } = await supabase
                .from('company')
                .select('id')
                .eq('user_id', req.body.userId)
                .single();

            if (compErr || !companyRecord) {
                return res.status(404).send(Utility.formatResponse(404, 'Company profile not found for logged-in user'));
            }

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
                type: 'distributor',
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

            // 2. Create the distributor profile linked to user and company
            const distributorPayload = {
                user_id: userData.id,
                company_id: companyRecord.id,
                name,
                email,
                contact_no,
                address,
                status: 'active',
                created_by: req.body.userId,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            const { data: distData, error: distError } = await supabase
                .from('distributor')
                .insert(distributorPayload)
                .select('id')
                .single();

            if (distError) {
                // Rollback user creation
                await supabase.from('users').delete().eq('id', userData.id);
                throw distError;
            }

            res.status(200).send(Utility.formatResponse(200, { id: distData.id }));
        } catch (err) {
            console.error("Distributor creation error:", err);
            res.status(409).send(Utility.formatResponse(409, err.message || "Error creating distributor"));
        }
    },

    /** Get all distributors (Admin view) */
    getDistributors: async (req, res) => {
        try {
            const { page, size, search, company_id } = req.query;
            const { limit, offset } = Utility.getPagination(parseInt(page), parseInt(size));

            let query = supabase
                .from('distributor')
                .select('*, company(name)', { count: 'exact' });

            if (company_id) {
                query = query.eq('company_id', company_id);
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
            console.error('getDistributors error:', err);
            res.status(500).send(Utility.formatResponse(500, err.message));
        }
    },

    /** Update distributor details (Company or Admin action) */
    updateDistributor: async (req, res) => {
        try {
            const payload = { ...req.body, updated_by: req.body.userId, updated_at: new Date().toISOString() };
            const id = payload.id;
            delete payload.userId;
            delete payload.id;

            // Retrieve distributor user_id
            const { data: distData, error: fetchError } = await supabase
                .from('distributor')
                .select('user_id')
                .eq('id', id)
                .single();

            if (fetchError) throw fetchError;

            // Update login credentials if modified
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
                    .eq('id', distData.user_id);
                if (userError) throw userError;
            }

            // Clean up updates for distributor table
            const distributorUpdates = {
                name: payload.name,
                email: payload.email,
                contact_no: payload.contact_no,
                address: payload.address,
                status: payload.status,
                company_id: payload.company_id,
                updated_by: req.body.userId,
                updated_at: new Date().toISOString()
            };

            // Remove undefined values
            Object.keys(distributorUpdates).forEach(key => distributorUpdates[key] === undefined && delete distributorUpdates[key]);

            const { error: distError } = await supabase
                .from('distributor')
                .update(distributorUpdates)
                .eq('id', id);

            if (distError) throw distError;

            res.status(200).send(Utility.formatResponse(200, 'Updated Successfully'));
        } catch (err) {
            console.error("updateDistributor error:", err);
            res.status(500).send(Utility.formatResponse(500, err.message));
        }
    },

    /** Get logged-in distributor user profile */
    getDistributorProfile: async (req, res) => {
        try {
            const { data, error } = await supabase
                .from('distributor')
                .select('*, company(*)')
                .eq('user_id', req.body.userId)
                .single();

            if (error || !data) {
                return res.status(404).send(Utility.formatResponse(404, 'Distributor profile not found'));
            }
            res.status(200).send(Utility.formatResponse(200, data));
        } catch (err) {
            res.status(500).send(Utility.formatResponse(500, err.message));
        }
    }
};

module.exports = distributorController;

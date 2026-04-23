/**
 * Copyright © 2023, Eden Sign Inc. ALL RIGHTS RESERVED.
 */

const supabase = require("../../supabase");
const Utility  = require("../../utility");

const userController = {
    /** Get users from database with pagination, type filter, and optional search */
    getUsers: async (req, res) => {
        try {
            const { page, size, search } = req.query;
            const { limit, offset } = Utility.getPagination(parseInt(page), parseInt(size));

            let query = supabase
                .from('users')
                .select('id, username, email, contact_no, type, gender, status, agreement, created_at, updated_at, created_by', { count: 'exact' });

            if (req.query.type) {
                const types = req.query.type.split(',');
                query = query.in('type', types);
            }

            if (search) {
                query = query.or(`username.ilike.%${search}%,email.ilike.%${search}%,status.ilike.${search}%`);
            }

            const { data, error, count } = await query
                .order('updated_at', { ascending: false })
                .range(offset, offset + limit - 1);

            if (error) throw error;

            if (count > 0) {
                res.status(200).send(Utility.formatResponse(200, { count, rows: data }));
            } else {
                res.status(404).send(Utility.formatResponse(404, 'No Data Found'));
            }
        } catch (err) {
            console.error('getUsers error:', err);
            res.status(500).send(Utility.formatResponse(500, err.message));
        }
    },

    /** Register a new user (admin-created) */
    register: async (req, res) => {
        console.log("User registration request received:", JSON.stringify(req.body, null, 2));
        const { username, password, email, contact_no } = req.body;

        if (!username || !password || !email || !contact_no) {
            return res.status(400).send(Utility.formatResponse(400, "Username, password, email, and contact number are required"));
        }

        try {
            const hash = await Utility.createHash(password);
            const payload = {
                ...req.body,
                password:   hash,
                status:     req.body.status || 'active',
                created_by: req.body.userId,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            // Remove userId from payload (not a table column)
            delete payload.userId;
            delete payload.id;

            const { data, error } = await supabase
                .from('users')
                .insert(payload)
                .select('id')
                .single();

            if (error) throw error;

            const token = Utility.getSignedToken(data.id);
            res.status(200).send(Utility.formatResponse(200, { token, id: data.id }));
        } catch (err) {
            console.error("User creation error:", err);
            res.status(409).send(Utility.formatResponse(409, err.message || "Error creating user"));
        }
    },

    /** Login admin/sales_executive user */
    login: async (req, res) => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('email', req.body.email)
                .eq('status', 'active')
                .single();

            if (error || !data) {
                return res.status(200).send(Utility.formatResponse(200, 'User does not exist'));
            }

            const isMatch = await Utility.comparePassword(req.body.password, data.password);
            if (isMatch) {
                const token = Utility.getSignedToken(data.id);
                res.status(200).send(Utility.formatResponse(200, {
                    token,
                    id:       data.id,
                    type:     data.type,
                    username: data.username
                }));
            } else {
                res.status(200).send(Utility.formatResponse(200, 'Username and Password do not match'));
            }
        } catch (err) {
            console.error('login error:', err);
            res.status(500).send(Utility.formatResponse(500, err.message));
        }
    },

    /** Get logged-in user's profile */
    profile: async (req, res) => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('id, username, email, contact_no, type, gender, status, agreement, created_at, updated_at, created_by')
                .eq('id', req.body.userId)
                .single();

            if (error || !data) {
                return res.status(404).send(Utility.formatResponse(404, 'User Not Found'));
            }
            res.status(200).send(Utility.formatResponse(200, data));
        } catch (err) {
            res.status(500).send(Utility.formatResponse(500, err.message));
        }
    },

    /** Update user record */
    updateUser: async (req, res) => {
        try {
            const payload = { ...req.body, updated_by: req.body.userId, updated_at: new Date().toISOString() };
            const id = payload.id;
            delete payload.userId;
            delete payload.id;

            if (payload.password) {
                payload.password = await Utility.createHash(payload.password);
            }

            const { error } = await supabase
                .from('users')
                .update(payload)
                .eq('id', id);

            if (error) throw error;
            res.status(200).send(Utility.formatResponse(200, 'Updated Successfully'));
        } catch (err) {
            res.status(500).send(Utility.formatResponse(500, err.message));
        }
    },

    /** Get salon agreement value for logged-in salon user */
    getAgreement: async (req, res) => {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('agreement')
                .eq('id', req.body.userId)
                .eq('type', 'salon')
                .single();

            if (error || !data) {
                return res.status(404).send(Utility.formatResponse(404, 'Invalid User Type'));
            }
            res.status(200).send(Utility.formatResponse(200, data.agreement));
        } catch (err) {
            res.status(500).send(Utility.formatResponse(500, err.message));
        }
    }
};

module.exports = userController;

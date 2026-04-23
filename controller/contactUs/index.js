/**
 * Copyright © 2023, Eden Sign Inc. ALL RIGHTS RESERVED.
 */

const supabase = require("../../supabase");
const Utility = require("../../utility");

const ContactUsController = {
    /** Create a new contact us entry */
    createContact: async (req, res) => {
        try {
            const { name, email, message } = req.body;

            if (!name || !email || !message) {
                return res.status(400).send(Utility.formatResponse(400, "Missing required fields: name, email, message"));
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).send(Utility.formatResponse(400, "Invalid email format"));
            }

            const { data, error } = await supabase
                .from('contact_us')
                .insert({ name, email, message })
                .select('*')
                .single();

            if (error) throw error;

            res.status(200).send(Utility.formatResponse(200, data));
        } catch (err) {
            console.error("Error creating contact entry:", err);
            res.status(500).send(Utility.formatResponse(500, err.message));
        }
    },

    /** Get all contact us entries */
    getContacts: async (req, res) => {
        try {
            const { data, count, error } = await supabase
                .from('contact_us')
                .select('*', { count: 'exact' })
                .order('created_at', { ascending: false });

            if (error) throw error;

            res.status(200).send(Utility.formatResponse(200, {
                rows: data || [],
                count: count || 0
            }));
        } catch (err) {
            console.error("Error fetching contacts:", err);
            res.status(500).send(Utility.formatResponse(500, err.message));
        }
    }
};

module.exports = ContactUsController;

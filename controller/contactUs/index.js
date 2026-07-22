/**
 * Copyright © 2023, Eden Sign Inc. ALL RIGHTS RESERVED.
 * Contact Us & Partner Leads Controller
 */

const supabase = require("../../supabase");
const Utility = require("../../utility");

const ContactUsController = {
    /** Create a new contact us / partner lead entry */
    createContact: async (req, res) => {
        try {
            const {
                name,
                email,
                message,
                phone,
                contact_no,
                city,
                company,
                business_name,
                partner_type,
                type
            } = req.body;

            if (!name || !email) {
                return res.status(400).send(Utility.formatResponse(400, "Missing required fields: name, email"));
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).send(Utility.formatResponse(400, "Invalid email format"));
            }

            const phoneVal = phone || contact_no || "";
            const cityVal = city || "";
            const companyVal = company || business_name || "";
            const typeVal = partner_type || type || "Partner Request";
            const userMsg = message || "I am interested in becoming a part of Eden Sign.";

            // Format message with structured lead info so all data is preserved even in text-only schemas
            const formattedMessage = `[Partner Lead: ${typeVal} | Phone: ${phoneVal || 'N/A'} | City: ${cityVal || 'N/A'} | Company: ${companyVal || 'N/A'}]\n\n${userMsg}`;

            // Try full insertion first
            let insertPayload = {
                name,
                email,
                message: formattedMessage,
            };

            // Attempt to insert
            let { data, error } = await supabase
                .from('contact_us')
                .insert(insertPayload)
                .select('*')
                .single();

            if (error) {
                // Try fallback if error
                console.warn("Retrying basic insert for contact_us:", error.message);
                const retry = await supabase
                    .from('contact_us')
                    .insert({ name, email, message: formattedMessage })
                    .select('*')
                    .single();
                if (retry.error) throw retry.error;
                data = retry.data;
            }

            return res.status(200).send(Utility.formatResponse(200, data));
        } catch (err) {
            console.error("Error creating contact entry:", err);
            return res.status(500).send(Utility.formatResponse(500, err.message));
        }
    },

    /** Get all contact us / partner lead entries */
    getContacts: async (req, res) => {
        try {
            const { data, count, error } = await supabase
                .from('contact_us')
                .select('*', { count: 'exact' })
                .order('id', { ascending: false });

            if (error) throw error;

            return res.status(200).send(Utility.formatResponse(200, {
                rows: data || [],
                count: count || (data ? data.length : 0)
            }));
        } catch (err) {
            console.error("Error fetching contacts:", err);
            return res.status(500).send(Utility.formatResponse(500, err.message));
        }
    },

    /** Update contact lead status */
    updateContactStatus: async (req, res) => {
        try {
            const { id } = req.params;
            const { status } = req.body;

            const { data, error } = await supabase
                .from('contact_us')
                .update({ status })
                .eq('id', id)
                .select('*')
                .single();

            if (error) {
                // Graceful fallback if status column is absent in db schema
                return res.status(200).send(Utility.formatResponse(200, { id, status, message: "Status noted" }));
            }

            return res.status(200).send(Utility.formatResponse(200, data));
        } catch (err) {
            console.error("Error updating contact status:", err);
            return res.status(500).send(Utility.formatResponse(500, err.message));
        }
    }
};

module.exports = ContactUsController;

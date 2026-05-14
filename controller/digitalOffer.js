/**
 * Copyright © 2023, Eden Sign Inc. ALL RIGHTS RESERVED.
 */

const supabase = require("../supabase");
const Utility = require("../utility");

const digitalOfferController = {
    /** Get all digital offers */
    getAllOffers: async (req, res) => {
        try {
            const { page, size, salonId, isActive } = req.query;
            const { limit, offset } = Utility.getPagination(parseInt(page), parseInt(size));

            let query = supabase
                .from('digital_offers')
                .select('*, salon:salon_id(id, name)', { count: 'exact' });

            if (salonId) {
                query = query.eq('salon_id', salonId);
            }

            if (isActive !== undefined) {
                query = query.eq('is_active', isActive);
            }

            const { data, count, error } = await query
                .order('created_at', { ascending: false })
                .range(offset, offset + limit - 1);

            if (error) throw error;

            if (count > 0) {
                res.status(200).send(Utility.formatResponse(200, { count, rows: data }));
            } else {
                res.status(404).send(Utility.formatResponse(404, `No Offers Found`));
            }
        } catch (err) {
            console.error("digitalOffer getAllOffers error:", err);
            res.status(500).send(Utility.formatResponse(500, err.message));
        }
    },

    /** Get offer by ID */
    getOfferById: async (req, res) => {
        try {
            const { data, error } = await supabase
                .from('digital_offers')
                .select('*')
                .eq('id', req.params.id)
                .single();

            if (error && error.code !== 'PGRST116') throw error;

            if (data) {
                res.status(200).send(Utility.formatResponse(200, data));
            } else {
                res.status(404).send(Utility.formatResponse(404, `Offer not found`));
            }
        } catch (err) {
            console.error("digitalOffer getOfferById error:", err);
            res.status(500).send(Utility.formatResponse(500, err.message));
        }
    },

    /** Create a new digital offer */
    createOffer: async (req, res) => {
        try {
            const payload = { 
                ...req.body,
                created_at: new Date().toISOString()
            };
            
            // Allow admin to set salon_id, but default to the logged-in salon if not provided
            if (!payload.salon_id && req.body.userId) {
                const { data: salonData } = await supabase
                    .from('salon')
                    .select('id')
                    .eq('user_id', req.body.userId)
                    .single();
                
                if (salonData) {
                    payload.salon_id = salonData.id;
                }
            }
            delete payload.userId;

            const { error } = await supabase
                .from('digital_offers')
                .insert(payload);

            if (error) throw error;

            res.status(200).send(Utility.formatResponse(200, `Offer Created Successfully`));
        } catch (err) {
            console.error("digitalOffer createOffer error:", err);
            res.status(500).send(Utility.formatResponse(500, err.message));
        }
    },

    /** Update an existing digital offer */
    updateOffer: async (req, res) => {
        try {
            const payload = { ...req.body };
            const id = payload.id;
            delete payload.userId;
            delete payload.id;

            const { error } = await supabase
                .from('digital_offers')
                .update(payload)
                .eq('id', id);

            if (error) throw error;

            res.status(200).send(Utility.formatResponse(200, `Offer Updated Successfully`));
        } catch (err) {
            console.error("digitalOffer updateOffer error:", err);
            res.status(500).send(Utility.formatResponse(500, err.message));
        }
    },

    /** Delete a digital offer */
    deleteOffer: async (req, res) => {
        try {
            const { error } = await supabase
                .from('digital_offers')
                .delete()
                .eq('id', req.query.id);

            if (error) throw error;

            res.status(200).send(Utility.formatResponse(200, "Offer was deleted successfully!"));
        } catch (err) {
            console.error("digitalOffer deleteOffer error:", err);
            res.status(500).send(Utility.formatResponse(500, "Could not delete Offer"));
        }
    },

    // ---------------------- USER OFFER CARDS ----------------------

    /** Claim an offer and create a user offer card */
    claimOffer: async (req, res) => {
        try {
            const { offer_id, customer_name, customer_address, customer_phone } = req.body;
            const user_id = req.body.userId; // Provided by verifyToken

            if (!offer_id) return res.status(400).send(Utility.formatResponse(400, "offer_id is required"));

            // Prevent duplicate claims
            const { data: existingCard, error: fetchError } = await supabase
                .from('user_offer_cards')
                .select('id')
                .eq('offer_id', offer_id)
                .eq('user_id', user_id)
                .limit(1)
                .maybeSingle();

            if (fetchError) throw fetchError;
            if (existingCard) {
                return res.status(400).send(Utility.formatResponse(400, "You have already claimed this offer card."));
            }

            // Fetch the offer to determine validity
            const { data: offerData, error: offerError } = await supabase
                .from('digital_offers')
                .select('*')
                .eq('id', offer_id)
                .single();

            if (offerError || !offerData) {
                return res.status(404).send(Utility.formatResponse(404, "Offer not found"));
            }

            // Generate unique card ID
            const card_id = `OC-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

            // Calculate valid_till date
            let valid_till;
            if (offerData.validity_type === 'date' && offerData.expiry_date) {
                valid_till = offerData.expiry_date;
            } else if (offerData.validity_type === 'duration' && offerData.duration_days) {
                const date = new Date();
                date.setDate(date.getDate() + parseInt(offerData.duration_days));
                valid_till = date.toISOString();
            } else {
                // Default 30 days if not properly set
                const date = new Date();
                date.setDate(date.getDate() + 30);
                valid_till = date.toISOString();
            }

            const payload = {
                user_id,
                offer_id,
                customer_name,
                customer_address,
                customer_phone,
                card_id,
                valid_till,
                status: 'active',
                created_at: new Date().toISOString()
            };

            const { data, error } = await supabase
                .from('user_offer_cards')
                .insert(payload)
                .select()
                .single();

            if (error) throw error;

            res.status(200).send(Utility.formatResponse(200, data));
        } catch (err) {
            console.error("digitalOffer claimOffer error:", err);
            res.status(500).send(Utility.formatResponse(500, err.message));
        }
    },

    /** Get user's claimed offer cards */
    getUserCards: async (req, res) => {
        try {
            const user_id = req.body.userId; // from verifyToken
            const { page, size, status } = req.query;
            const { limit, offset } = Utility.getPagination(parseInt(page), parseInt(size));

            let query = supabase
                .from('user_offer_cards')
                .select(`
                    *,
                    offer:digital_offers (
                        title, discount_amount, discount_percentage, price, logo_url, terms, services,
                        salon:salon_id(id, name, email)
                    )
                `, { count: 'exact' })
                .eq('user_id', user_id);

            if (status) {
                query = query.eq('status', status);
            }

            const { data, count, error } = await query
                .order('created_at', { ascending: false })
                .range(offset, offset + limit - 1);

            if (error) throw error;

            res.status(200).send(Utility.formatResponse(200, {
                count: count || 0,
                rows: data || []
            }));
        } catch (err) {
            console.error("digitalOffer getUserCards error:", err);
            res.status(500).send(Utility.formatResponse(500, err.message));
        }
    }
};

module.exports = digitalOfferController;

/**
 * Copyright © 2023, Eden Sign Inc. ALL RIGHTS RESERVED.
 */

const supabase = require("../../supabase");
const Utility = require("../../utility");

const ReviewController = {
    /** Create a new review */
    createReview: async (req, res) => {
        try {
            const {
                salon_id, customer_id, quality_of_service, facilities,
                staff, flexibility, value_of_money, reason, comments
            } = req.body;

            if (!salon_id) {
                return res.status(400).send(Utility.formatResponse(400, "Missing required field: salon_id"));
            }

            const ratings = [quality_of_service, facilities, staff, flexibility, value_of_money];
            for (const rating of ratings) {
                if (rating !== undefined && (rating < 0 || rating > 5)) {
                    return res.status(400).send(Utility.formatResponse(400, "Rating values must be between 0 and 5"));
                }
            }

            const { data, error } = await supabase
                .from('review')
                .insert({
                    salon_id,
                    customer_id: customer_id || null,
                    quality_of_service: quality_of_service || 0,
                    facilities: facilities || 0,
                    staff: staff || 0,
                    flexibility: flexibility || 0,
                    value_of_money: value_of_money || 0,
                    reason: reason || null,
                    comments: comments || null
                })
                .select('id')
                .single();

            if (error) throw error;

            res.status(200).send(Utility.formatResponse(200, { id: data.id, message: "Review submitted successfully" }));
        } catch (err) {
            console.error("Error creating review:", err);
            res.status(500).send(Utility.formatResponse(500, err.message));
        }
    },

    /** Get all reviews for a salon */
    getReviewsBySalon: async (req, res) => {
        try {
            const { salon_id } = req.params;

            if (!salon_id) {
                return res.status(400).send(Utility.formatResponse(400, "Missing required parameter: salon_id"));
            }

            const { data, count, error } = await supabase
                .from('review')
                .select('*, customer(username)', { count: 'exact' })
                .eq('salon_id', salon_id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            res.status(200).send(Utility.formatResponse(200, {
                rows: data || [],
                count: count || 0
            }));
        } catch (err) {
            console.error("Error fetching reviews:", err);
            res.status(500).send(Utility.formatResponse(500, err.message));
        }
    },

    /** Create a new website review */
    createWebsiteReview: async (req, res) => {
        try {
            const {
                customer_id, ease_of_use, design_aesthetics,
                speed_performance, booking_process, overall_experience,
                reason, comments
            } = req.body;

            const ratings = [ease_of_use, design_aesthetics, speed_performance, booking_process, overall_experience];
            for (const rating of ratings) {
                if (rating !== undefined && (rating < 0 || rating > 5)) {
                    return res.status(400).send(Utility.formatResponse(400, "Rating values must be between 0 and 5"));
                }
            }

            const { data, error } = await supabase
                .from('website_review')
                .insert({
                    customer_id: customer_id || null,
                    ease_of_use: ease_of_use || 0,
                    design_aesthetics: design_aesthetics || 0,
                    speed_performance: speed_performance || 0,
                    booking_process: booking_process || 0,
                    overall_experience: overall_experience || 0,
                    reason: reason || null,
                    comments: comments || null
                })
                .select('id')
                .single();

            if (error) throw error;

            res.status(200).send(Utility.formatResponse(200, { id: data.id, message: "Website review submitted successfully" }));
        } catch (err) {
            console.error("Error creating website review:", err);
            res.status(500).send(Utility.formatResponse(500, err.message));
        }
    },

    /** Get all website experience reviews */
    getWebsiteReviews: async (req, res) => {
        try {
            const { data, count, error } = await supabase
                .from('website_review')
                .select('*, customer(username)', { count: 'exact' })
                .order('created_at', { ascending: false });

            if (error) throw error;

            res.status(200).send(Utility.formatResponse(200, {
                rows: data || [],
                count: count || 0
            }));
        } catch (err) {
            console.error("Error fetching website reviews:", err);
            res.status(500).send(Utility.formatResponse(500, err.message));
        }
    }
};

module.exports = ReviewController;

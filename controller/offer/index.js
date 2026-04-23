/**
 * Copyright © 2023, Eden Sign Inc. ALL RIGHTS RESERVED.
 */

const supabase = require("../../supabase");
const Utility = require("../../utility");

const offerController = {
    getOffers: async (req, res) => {
        try {
            const { data: offers, error } = await supabase
                .from('offer')
                .select('*')
                .eq('is_active', true);

            if (error) throw error;

            if (!offers || offers.length === 0) {
                return res.status(200).json(Utility.formatResponse(200, {
                    offers: [{
                        id: 1, 
                        title: 'Flat 50% Off on Haircut',
                        description: 'Get an exclusive haircut and styling for half the price.',
                        image_url: 'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                        discount_amount: 50.00,
                        is_active: true
                    }]
                }));
            }
            return res.status(200).json(Utility.formatResponse(200, { offers }));
        } catch (error) {
            console.error("Get offers error:", error);
            return res.status(500).json(Utility.formatResponse(500, "Internal server error"));
        }
    }
};

module.exports = offerController;

/**
 * Copyright © 2023, Eden Sign Inc. ALL RIGHTS RESERVED.
 */

const supabase = require("../../supabase");
const Utility = require("../../utility");

const bannerController = {
    getBanners: async (req, res) => {
        try {
            const { data: banners, error } = await supabase
                .from('banner')
                .select('*')
                .eq('is_active', true);

            if (error) throw error;

            if (!banners || banners.length === 0) {
                return res.status(200).json(Utility.formatResponse(200, {
                    banners: [{
                        id: 1, 
                        image_url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                        link: '',
                        is_active: true
                    }]
                }));
            }
            return res.status(200).json(Utility.formatResponse(200, { banners }));
        } catch (error) {
            console.error("Get banners error:", error);
            return res.status(500).json(Utility.formatResponse(500, "Internal server error"));
        }
    }
};

module.exports = bannerController;

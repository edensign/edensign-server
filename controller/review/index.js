/**
 * Copyright © 2023, Eden Sign Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of Eden Sign Inc., and is licensed as
 * restricted rights software. The use, reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with Eden Sign.
 */

const ReviewModel = require("../../model/review");
const Utility = require("../../utility");

const ReviewController = {
    /** Create a new review
     */
    createReview: (req, res) => {
        return new Promise((resolve, reject) => {
            const {
                salon_id,
                customer_id,
                quality_of_service,
                facilities,
                staff,
                flexibility,
                value_of_money,
                reason,
                comments
            } = req.body;

            // Validate required field
            if (!salon_id) {
                return resolve(res.status(400).send(Utility.formatResponse(400, "Missing required field: salon_id")));
            }

            // Validate rating values (0-5)
            const ratings = [quality_of_service, facilities, staff, flexibility, value_of_money];
            for (const rating of ratings) {
                if (rating !== undefined && (rating < 0 || rating > 5)) {
                    return resolve(res.status(400).send(Utility.formatResponse(400, "Rating values must be between 0 and 5")));
                }
            }

            ReviewModel.create({
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
                .then(review => {
                    resolve(res.status(200).send(Utility.formatResponse(200, { id: review.id, message: "Review submitted successfully" })));
                })
                .catch(err => {
                    console.log("Error creating review:", err);
                    reject(res.status(500).send(Utility.formatResponse(500, err)));
                });
        });
    },

    /** Get all reviews for a salon
     */
    getReviewsBySalon: (req, res) => {
        return new Promise((resolve, reject) => {
            const { salon_id } = req.params;

            if (!salon_id) {
                return resolve(res.status(400).send(Utility.formatResponse(400, "Missing required parameter: salon_id")));
            }

            ReviewModel.findAll({
                where: { salon_id },
                order: [['created_at', 'DESC']]
            })
                .then(reviews => {
                    resolve(res.status(200).send(Utility.formatResponse(200, {
                        rows: reviews || [],
                        count: reviews?.length || 0
                    })));
                })
                .catch(err => {
                    console.log("Error fetching reviews:", err);
                    reject(res.status(500).send(Utility.formatResponse(500, err)));
                });
        });
    }
};

module.exports = ReviewController;

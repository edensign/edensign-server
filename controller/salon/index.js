/**
 * Copyright © 2023, Eden Sign Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of Eden Sign Inc., and is licensed as
 * restricted rights software. The use, reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with Eden Sign.
 */

const { Op } = require("sequelize");

const SalonModel = require("../../model/salon");
const Utility = require("../../utility");

const salonController = {
    /** Get salons from database based on query type, page, size and search if provided
     */
    getSalons: (req, res) => {
        const { page, size, search } = req.query;
        const { limit, offset } = Utility.getPagination(parseInt(page), parseInt(size));

        return new Promise((resolve, reject) => {
            let searchCond = {};
            if (search) {
                searchCond = {
                    [Op.or]: [
                        {
                            name: {
                                [Op.like]: `%${search}%`
                            }
                        },
                        {
                            email: {
                                [Op.like]: `%${search}%`
                            }
                        },
                        {
                            status: {
                                [Op.like]: `${search}%`
                            }
                        }
                    ]
                };
            }
            SalonModel.findAndCountAll({
                limit, offset, where: { ...searchCond }, order: [
                    ["updated_at", "DESC"]
                ]
            })
                .then(list => {
                    const { count, rows } = list;
                    (count > 0) ?
                        resolve(res.status(200).send(Utility.formatResponse(200, { count, rows })))
                        :
                        resolve(res.status(404).send(Utility.formatResponse(404, `No Data Found`)));
                })
                .catch(err => {
                    reject(res.status(500).send(Utility.formatResponse(500, err)));
                });
        });
    },
    /** Creating salon in the database
    */
    createSalon: (req, res) => {
        return new Promise((resolve, reject) => {
            const payload = req.body;
            SalonModel.create({ ...payload, created_by: req.body.userId })
                .then(salon => {
                    resolve(res.status(200).send(Utility.formatResponse(200, { id: salon.id })));
                })
                .catch(err => {
                    resolve(res.status(409).send(Utility.formatResponse(409, `${err.errors[0].message}`)));
                });     //`${err.errors[0].message}`  this was added when it was sequelize constraint error
        });
    },
    /** Updating Salon in the database
     */
    updateSalon: (req, res) => {
        return new Promise((resolve, reject) => {
            const payload = req.body;
            SalonModel.update({ ...payload, updated_by: req.body.userId }, { where: { id: req.body.id } })
                .then(updatedData => {
                    resolve(res.status(200).send(Utility.formatResponse(200, `Updated Successfully`)));
                })
                .catch(err => {
                    reject(res.status(500).send(Utility.formatResponse(500, err)));
                });
        });
    },
    /** Finding salon in the database from user id that is received
     */
    getSalonByUserId: (req, res) => {
        return new Promise((resolve, reject) => {
            SalonModel.findOne({ where: { user_id: req.body.id } })
                .then(salon => {
                    if (salon) {
                        resolve(res.status(200).send(Utility.formatResponse(200, salon)));
                    } else {
                        resolve(res.status(404).send(Utility.formatResponse(404, `No Data Found`)));
                    }
                })
                .catch(err => {
                    reject(res.status(500).send(Utility.formatResponse(500, err)));
                });
        });
    },
    /** Get all the salons & their associated addresses by performing left outer join on both tables
     */
    getSalonList: (req, res) => {
        return new Promise(async (resolve, reject) => {
            const queryString = `SELECT salon.id, salon.banner_image, salon.name, salon.type, salon.salon_code,
                                    address.street, address.landmark
                                    FROM salon 
                                    INNER JOIN address ON salon.id = address.parent_id
                                    ORDER BY salon.priority`;
            Utility.executeQuery(queryString)
                .then(data => {
                    data ?
                        resolve(res.status(200).send(Utility.formatResponse(200, data)))
                        :
                        resolve(res.status(404).send(Utility.formatResponse(404, `No Data Found`)));
                })
                .catch(err => {
                    reject(res.status(500).send(Utility.formatResponse(500, err)));
                });
        });
    },
    /** Get the salons, their associated addresses & their images by performing join on multiple tables
     */
    getSalonDetail: (req, res) => {
        return new Promise((resolve, reject) => {
            const salonDetail = {
                salon: {},
                images: []
            };
            const salon_code = req.body.code;
            console.log(req.body.code, typeof (req.body.code))
            const queryString = `SELECT sa.*, 
                                    address.street, address.landmark, images.image_src
                                    FROM salon sa
                                    LEFT OUTER JOIN address ON sa.id = address.parent_id 
                                    LEFT OUTER JOIN images ON  sa.id = images.parent_id
                                    WHERE sa.salon_code = '${salon_code}' ORDER BY images.priority`;

            Utility.executeQuery(queryString)
                .then(response => {
                    if (response) {
                        response.map(salon => {
                            salonDetail.salon = { ...salon };
                            salonDetail.images.push(salon.image_src);
                        });
                        if (salonDetail.salon.image_src) {
                            delete salonDetail.salon.image_src;
                        }
                        console.log("Salon detail=>", salonDetail)
                        resolve(res.status(200).send(Utility.formatResponse(200, salonDetail)));
                    } else {
                        resolve(res.status(404).send(Utility.formatResponse(404, `No Data Found`)));
                    }
                })
                .catch(err => {
                    reject(res.status(500).send(Utility.formatResponse(500, err)));
                });
        });
    }
}

module.exports = salonController;

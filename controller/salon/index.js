/**
 * Copyright © 2023, Eden Sign Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of Eden Sign Inc., and is licensed as
 * restricted rights software. The use, reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with Eden Sign.
 */

const { Op } = require("sequelize");
const Sequelize = require("sequelize");

const SalonModel = require("../../model/salon");
const Utility = require("../../utility");

const salonController = {
    /** Get salons from database based on query type, page, size and search if provided
     */
    getSalons: (req, res) => {
        const { page, size, search } = req.query;
        const { limit, offset } = Utility.getPagination(parseInt(page), parseInt(size));
        let cond = null;

        if (req.query.type) {
            cond = req.query.type.split(',');
        }
        return new Promise((resolve, reject) => {
            let searchCond = {
                type: cond
            };
            if (search) {
                searchCond = {
                    ...searchCond,
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
                        }
                    ]
                };
            }   //where: { ...searchCond },  to be specified
            SalonModel.findAndCountAll({
                limit, offset, order: [
                    ["updated_at", "DESC"]
                ]
            })
                .then(list => {
                    const { count, rows } = list;

                    if (count > 0) {
                        resolve(res.status(200).send(Utility.formatResponse(200, { count, rows })));
                    } else {
                        resolve(res.status(404).send(Utility.formatResponse(404, `No Data Found`)));
                    }
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
    /** Finding salon in the database by user id
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
    }
}

module.exports = salonController;

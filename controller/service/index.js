/**
 * Copyright © 2023, Eden Sign Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of Eden Sign Inc., and is licensed as
 * restricted rights software. The use, reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with Eden Sign.
 */

const { Op } = require("sequelize");
const Sequelize = require("sequelize");

const ServiceModel = require("../../model/service");
const Utility = require("../../utility");

const ServiceController = {
    /** Get services from database based on query type, page, size and search if provided
     */
    getAll: (req, res) => {
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
                            status: {
                                [Op.like]: `${search}%`
                            }
                        }
                    ]
                };
            }
            ServiceModel.findAndCountAll({
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
    /** Creating Service in the database
     */
    createService: (req, res) => {
        return new Promise((resolve, reject) => {
            const payload = req.body;
            ServiceModel.create({ ...payload, created_by: req.body.userId })
                .then(service => {
                    resolve(res.status(200).send(Utility.formatResponse(200, { id: service.id })));
                })
                .catch(err => {
                    resolve(res.status(409).send(Utility.formatResponse(409, `${err.errors[0].message}`)));
                });     //`${err.errors[0].message}`  this was added when it was sequelize constraint error
        });
    },
    /** Updating Service in the database
     */
    updateService: (req, res) => {
        return new Promise((resolve, reject) => {
            const payload = req.body;
            ServiceModel.update({ ...payload, updated_by: req.body.userId }, { where: { id: req.body.id } })
                .then(updatedData => {
                    resolve(res.status(200).send(Utility.formatResponse(200, `Updated Successfully`)));
                })
                .catch(err => {
                    reject(res.status(500).send(Utility.formatResponse(500, err)));
                });
        });
    }
};

module.exports = ServiceController;

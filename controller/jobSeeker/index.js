/**
 * Copyright © 2023, Eden Sign Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of Eden Sign Inc., and is licensed as
 * restricted rights software. The use, reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with Eden Sign.
 */

const { Op } = require("sequelize");

const JobSeekerModel = require("../../model/jobSeeker");
const Utility = require("../../utility");

const JobSeekerController = {
    /** Get Job Seekers from database based on query type, page, size and search if provided
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
            JobSeekerModel.findAndCountAll({
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
    /** Creating Job Seeker in the database
    */
    createJobSeeker: (req, res) => {
        return new Promise((resolve, reject) => {
            const payload = req.body;
            JobSeekerModel.create({ ...payload, created_by: payload.userId })
                .then(JobSeeker => {
                    resolve(res.status(200).send(Utility.formatResponse(200, { id: JobSeeker.id })));
                })
                .catch(err => {
                    resolve(res.status(409).send(Utility.formatResponse(409, `${err.errors[0].message}`)));
                });     //`${err.errors[0].message}`  this was added when it was sequelize constraint error
        });
    },
    /** Updating Job Seeker in the database
     */
    updateJobSeeker: (req, res) => {
        return new Promise((resolve, reject) => {
            const payload = req.body;
            JobSeekerModel.update({ ...payload, updated_by: payload.userId }, { where: { id: payload.id } })
                .then(updatedData => {
                    resolve(res.status(200).send(Utility.formatResponse(200, `Updated Successfully`)));
                })
                .catch(err => {
                    reject(res.status(500).send(Utility.formatResponse(500, err)));
                });
        });
    },

    /** Get all the Job Seekers & their associated addresses by performing left outer join on both tables,
     * this api is for edensign website
     */
    getJobSeekerDetail: (req, res) => {
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
    }
};

module.exports = JobSeekerController;

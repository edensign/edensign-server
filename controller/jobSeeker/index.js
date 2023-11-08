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
                limit, offset, where: { ...searchCond, status: "active" }, order: [
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
    // getJobSeeker: (req, res) => {
    //     return new Promise(async (resolve, reject) => {
    //         const queryString = `SELECT js.id, js.name, js.email, js.contact_no, js.age, js.gender, js.qualification, js.status, js.skills,
    //                                 js.description, js.hobbies, js.resume, js.experience,
    //                                 address.street, address.landmark, address.city, address.state, address.zipcode
    //                                 FROM job_seeker AS js
    //                                 LEFT OUTER JOIN address ON address.parent_id = js.id`;
    //         Utility.executeQuery(queryString)
    //             .then(data => {
    //                 data ?
    //                     resolve(res.status(200).send(Utility.formatResponse(200, data)))
    //                     :
    //                     resolve(res.status(404).send(Utility.formatResponse(404, `No Data Found`)));
    //             })
    //             .catch(err => {
    //                 reject(res.status(500).send(Utility.formatResponse(500, err)));
    //             });
    //     });
    // },
    /** Get all the job seekers & their associated addresses by performing left outer join on both tables
     */
    getJobSeekerDetail: (req, res) => {
        const { page, size } = req.params;
        const { limit, offset } = Utility.getPagination(parseInt(page), parseInt(size));

        function isObjectEmpty(obj) {
            return Object.keys(obj).length === 0;
        }

        console.log('query=>', req.query)
        console.log('params=>', req.params)

        // if (req.query.gender) {
        //     sex = req.query.gender;
        // }
        return new Promise(async (resolve, reject) => {
            // let genderQuery = {
            //     gender: sex
            // }
            if (isObjectEmpty(req.query)) {
                //Selects all columns that match the inner join condition, 2nd select is a subquery that returns row count as result_count
                const queryString = `SELECT job.id, job.name, job.email, job.contact_no, job.age, job.gender,
                                    job.qualification, job.status, job.skills, job.experience, job.resume,
                                    job.description, job.designation,
                                    addr.street, addr.landmark, addr.zipcode, addr.city, addr.state, addr.country,
                                    (SELECT COUNT(*) FROM job_seeker) AS result_count
                                    FROM job_seeker AS job
                                    INNER JOIN address as addr ON job.id = addr.parent_id
                                    LIMIT ${limit} OFFSET ${offset}`;
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
            } else {
                var skillParam = '';
                var experienceParam = '';
                let genderParam = req.query.gender ? `gender='${req.query.gender}'` : '';

                if (req.query.experience) {
                    const experienceRange = req.query.experience.split(',');
                    experienceParam = `experience BETWEEN ${experienceRange[0]} AND ${experienceRange[1]}`;
                    if (genderParam && experienceParam) {
                        genderParam += " AND";
                    }
                    console.log(experienceParam)
                    console.log(experienceRange)
                }

                if (req.query.skills) {
                    const skillId = req.query.skills.split(',');
                    skillId.forEach((element, index) => {
                        if (index === skillId.length - 1) {
                            skillParam += `FIND_IN_SET('${element}', skills) > 0`;
                            if (index === skillId.length - 1 && (genderParam || experienceParam)) {
                                skillParam += " AND";
                            }
                        } else {
                            skillParam += `FIND_IN_SET('${element}', skills) > 0 OR `;
                        }
                    });
                    console.log(skillParam)
                    console.log(skillId)
                }

                //Selects all columns that match the inner join condition, 2nd select is a subquery that returns row count as result_count
                const queryString = `SELECT job.id, job.name, job.email, job.contact_no, job.age, job.gender,
                                    job.qualification, job.status, job.skills, job.experience, job.resume,
                                    job.description, job.designation,
                                    addr.street, addr.landmark, addr.zipcode, addr.city, addr.state, addr.country,
                                    (SELECT COUNT(*) FROM job_seeker WHERE ${skillParam} ${genderParam} ${experienceParam}) AS result_count
                                    FROM job_seeker AS job
                                    INNER JOIN address as addr ON job.id = addr.parent_id
                                    WHERE ${skillParam} ${genderParam} ${experienceParam}
                                    LIMIT ${limit} OFFSET ${offset}`;
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
            }
        });
    }
};

module.exports = JobSeekerController;

/**
 * Copyright © 2023, Eden Sign Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of Eden Sign Inc., and is licensed as
 * restricted rights software. The use, reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with Eden Sign.
 */

const { Op } = require("sequelize");

const SkillModel = require("../../model/skill");
const Utility = require("../../utility");


const SkillController = {
    /** Get all skills from the database
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
            SkillModel.findAndCountAll({ limit, offset, where: { ...searchCond } })
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
    /** Create new Skill
     */
    createSkill: (req, res) => {
        const payload = req.body;
        console.log('body=', req.body)
        return new Promise((resolve, reject) => {
            SkillModel.create({ ...payload, created_by: payload.userId })
                .then(skill => {
                    console.log('skill=', skill)
                    resolve(res.status(200).send(Utility.formatResponse(200, { id: skill.id })));
                })
                .catch(err => {
                    console.log('error=', err)
                    resolve(res.status(409).send(Utility.formatResponse(409, "Error")));
                });
        });
    },
    /** Updating skill in the database based on parent and parent_id
     */
    updateSkill: (req, res) => {
        return new Promise((resolve, reject) => {
            const payload = req.body;
            SkillModel.update({ ...payload, updated_by: payload.userId }, { where: { id: payload.id } })
                .then(updatedData => {
                    resolve(res.status(200).send(Utility.formatResponse(200, `Updated Successfully`)));
                })
                .catch(err => {
                    reject(res.status(500).send(Utility.formatResponse(500, err)));
                });
        });
    },
    /** Finding skill in the database from id that is received
     */
    getSkillById: (req, res) => {
        console.log("req=", req.params)
        return new Promise((resolve, reject) => {
            SkillModel.findOne({ where: { id: req.params.id } })
                .then(skill => {
                    skill ?
                        resolve(res.status(200).send(Utility.formatResponse(200, skill)))
                        :
                        resolve(res.status(404).send(Utility.formatResponse(404, `No Data Found`)));
                })
                .catch(err => {
                    reject(res.status(500).send(Utility.formatResponse(500, err)));
                });
        })
    }
};

module.exports = SkillController;

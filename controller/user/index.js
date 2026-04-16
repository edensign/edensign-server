/**
 * Copyright © 2023, Eden Sign Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of Eden Sign Inc., and is licensed as
 * restricted rights software. The use, reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with Eden Sign.
 */

const { Op } = require("sequelize");
const Sequelize = require("sequelize");

const UserModel = require("../../model/user");
const Utility = require("../../utility");

const userController = {
    /** Get users from database based on query type, page, size and search if provided
     */
    getUsers: (req, res) => {
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
                            username: {
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
            UserModel.findAndCountAll({
                limit, offset, where: { ...searchCond }, order: [
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
    /** Creating hash of password and a new user & assigning an Auth Token
    */
    register: (req, res) => {
        console.log("User registration request received:", JSON.stringify(req.body, null, 2));
        const { username, password, email, contact_no } = req.body;

        if (!username || !password || !email || !contact_no) {
            return res.status(400).send(Utility.formatResponse(400, "Username, password, email, and contact number are required"));
        }

        return new Promise((resolve, reject) => {
            const payload = req.body;
            Utility.createHash(payload.password)
                .then(hash => {
                    payload.password = hash;
                    // Defaulting status to active for admin-created users or new registrations if desired
                    if (!payload.status) payload.status = "active"; 

                    UserModel.create({ ...payload, created_by: req.body.userId })
                        .then(user => {
                            console.log("User created successfully with ID:", user.id);
                            const token = Utility.getSignedToken(user.id);
                            resolve(res.status(200).send(Utility.formatResponse(200, { token, id: user.id })));
                        })
                        .catch(err => {
                            console.error("User creation DB error:", err);
                            const errorMessage = (err.errors && err.errors.length > 0) 
                                ? err.errors[0].message 
                                : (err.message || "Database error occurred");
                            resolve(res.status(409).send(Utility.formatResponse(409, errorMessage)));
                        });
                })
                .catch(err => {
                    console.error("Hashing error:", err);
                    resolve(res.status(500).send(Utility.formatResponse(500, "Internal server error during password encryption")));
                });
        });
    },
    /** Finding entered email in database & comparing password, if matched, logging in the user & 
     * sending authentication token
     */
    login: (req, res) => {
        return new Promise((resolve, reject) => {
            UserModel.findOne({
                where: { email: req.body.email, status: "active" }
            }).then(user => {
                if (user) {
                    Utility.comparePassword(req.body.password, user.password)
                        .then((isMatch) => {
                            if (isMatch) {
                                const token = Utility.getSignedToken(user.id);
                                resolve(res.status(200)
                                    .send(Utility.formatResponse(200, {
                                        token,
                                        id: user.id,
                                        type: user.type,
                                        username: user.username
                                    })));
                            } else {
                                resolve(res.status(200).send(Utility
                                    .formatResponse(200, `Username and Password do not match`)));
                            }
                        });
                } else {
                    resolve(res.status(200).send(Utility.formatResponse(200, `User does not exist`)));
                }
            });
        });
    },
    /** Finding user in database, if found, display user's information
    */
    profile: (req, res) => {
        return new Promise((resolve, reject) => {
            UserModel.findByPk(req.body.userId, { attributes: { exclude: ['password'] } })
                .then(user => {
                    if (!user) {
                        resolve(res.status(404).send(Utility.formatResponse(404, `User Not Found`)));
                    } else {
                        resolve(res.status(200).send(Utility.formatResponse(200, user)));
                    }
                })
                .catch(err => {
                    reject(res.status(500).send(Utility.formatResponse(500, err)));
                });
        });
    },
    /** Updating user in the database
     */
    updateUser: (req, res) => {
        return new Promise((resolve, reject) => {
            const payload = req.body;
            if (payload.password) {     //this condition didn't run because we dont got the password
                Utility.createHash(payload.password)
                    .then(hash => {
                        payload.password = hash;
                        UserModel.update({ ...payload, updated_by: req.body.userId }, { where: { id: req.body.id } })
                            .then(updatedData => {
                                resolve(res.status(200).send(Utility.formatResponse(200, `Updated Successfully`)));
                            })
                            .catch(err => {
                                reject(res.status(500).send(Utility.formatResponse(500, err)));
                            });
                    })
            } else {
                UserModel.update({ ...payload, updated_by: req.body.userId }, { where: { id: req.body.id } })
                    .then(updatedData => {
                        resolve(res.status(200).send(Utility.formatResponse(200, `Updated Successfully`)));
                    })
                    .catch(err => {
                        reject(res.status(500).send(Utility.formatResponse(500, err)));
                    });
            }
        });
    },
    /** Finding salon user agreement value from the database by user id
    */
    getAgreement: (req, res) => {
        return new Promise((resolve, reject) => {
            UserModel.findOne({ where: { id: req.body.userId, type: "salon" } })
                .then(data => {
                    if (data) {
                        resolve(res.status(200).send(Utility.formatResponse(200, data.agreement)));
                    } else {
                        resolve(res.status(404).send(Utility.formatResponse(404, `Invalid User Type`)));
                    }
                })
                .catch(err => {
                    reject(res.status(500).send(Utility.formatResponse(500, err)));
                });
        });
    }
};

module.exports = userController;

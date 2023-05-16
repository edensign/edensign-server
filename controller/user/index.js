/**
 * Copyright © 2023, Eden Sign Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of Eden Sign Inc., and is licensed as
 * restricted rights software. The use, reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with Eden Sign.
 */

const UserModel = require("../../model/user");
const Utility = require("../../utility/index");
const Sequelize = require("sequelize");


const userController = {
    /** Creating hash of password and a new user & assigning an Auth Token
    */
    register: (req, res) => {
        return new Promise((resolve, reject) => {
            const payload = req.body;
            Utility.createHash(payload.password)
                .then((hash) => {
                    payload.password = hash;
                    UserModel.create({ ...payload, created_by: req.body.userId })
                        .then((user) => {
                            const token = Utility.getSignedToken(user.id);
                            resolve(res.status(200).send(Utility.formatResponse(200, { token })));
                        })
                        .catch((Sequelize.UniqueConstraintError, err => {
                            resolve(res.status(409).send(Utility.formatResponse(409, `${err.errors[0].message}`)));
                        }));
                })
                .catch(err => {
                    reject(err);
                });
        });
    },
    /** Finding entered email in database & comparing password, if matched, logging in the user & 
     * sending authentication token
     */
    login: (req, res) => {
        return new Promise((resolve, reject) => {
            UserModel.findOne({
                where: { email: req.body.email }
            }).then((user) => {
                if (user) {
                    Utility.comparePassword(req.body.password, user.password)
                        .then((isMatch) => {
                            if (isMatch) {
                                const token = Utility.getSignedToken(user.id);
                                resolve(res.status(200).send(Utility.formatResponse(200, { token })));
                            } else {
                                resolve(res.status(200).send(Utility.formatResponse(200, `Username and Password do not match`)));
                            };
                        });
                } else {
                    resolve(res.status(200).send(Utility.formatResponse(200, `User does not exist`)));
                };
            });
        });
    },
    /** Finding user in database, if found, display user's information
    */
    profile: (req, res) => {
        return new Promise((resolve, reject) => {
            UserModel.findByPk(req.body.userId, { attributes: { exclude: ['password'] } })
                .then(user => {
                    if (!user) resolve(res.status(404).send(Utility.formatResponse(404, `User Not Found`)));
                    else resolve(res.status(200).send(Utility.formatResponse(200, user)));
                })
                .catch(err => {
                    reject(res.status(500).send(Utility.formatResponse(500, err)));
                });
        });
    },
    /** Finding user in database, if found then updating it with newly entered data
     */
    updateUser: (req, res) => {
        return new Promise((resolve, reject) => {
            UserModel.findByPk(req.params.id)
                .then(user => {
                    if (user) {
                        const updatedUserObject = { ...user, ...req.body };
                        UserModel.update({ ...updatedUserObject, updated_by: req.body.userId }, { where: { id: req.params.id } })
                            .then(updatedData => {
                                resolve(res.status(200).send(Utility.formatResponse(200, `Updated Successfully`)));
                            })
                            .catch(err => {
                                reject(res.status(500).send(Utility.formatResponse(500, err)));
                            });
                    } else {
                        resolve(res.status(404).send(Utility.formatResponse(404, `User Not Found`)));
                    };
                })
                .catch(err => {
                    reject(res.status(500).send(Utility.formatResponse(500, err)));
                });
        });
    },
}

module.exports = userController;

/**
 * Copyright © 2023, Eden Sign Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of Eden Sign Inc., and is licensed as
 * restricted rights software. The use, reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with Eden Sign.
 */

const CountryModel = require("../../model/country");
const Utility = require("../../utility/index");
const Sequelize = require("sequelize");


const countryController = {
    /** Creating a new country & assigning an Auth Token
    */
    countryCreate: (req, res) => {
        return new Promise((resolve, reject) => {
            const payload = req.body;
            console.log("ress dataa");
                    CountryModel.create({ ...payload, created_by: req.body.id })
                        .then((country) => {
                            resolve(res.status(200).send(Utility.formatResponse(200, { country })));
                        })
                        .catch(err => {
                            resolve(res.status(409).send(Utility.formatResponse(409, `${err.errors[0].message}`)));
                        });

        });
    },

    /** Finding country in database, if found, display country information
    */
    profile: (req, res) => {
        return new Promise((resolve, reject) => {
            CountryModel.findByPk(req.body.userId, { attributes: { exclude: ['password'] } })
                .then(user => {
                    if (!user) resolve(res.status(404).send(Utility.formatResponse(404, `User Not Found`)));
                    else resolve(res.status(200).send(Utility.formatResponse(200, user)));
                })
                .catch(err => {
                    reject(res.status(500).send(Utility.formatResponse(500, err)));
                });
        });
    },
    /** Finding country in database, if found then updating it with newly entered data
     */
    updateCountry: (req, res) => {
        return new Promise((resolve, reject) => {
            CountryModel.findByPk(req.params.id)
                .then(country => {
                    if (country) {
                        console.log("res value");
                        console.log(res.params);
                        const updatedUserObject = { ...country, ...req.body };
                        CountryModel.update({ ...updatedUserObject, updated_by: req.body.userId }, { where: { id: req.params.id } })
                            .then(updatedData => {
                                resolve(res.status(200).send(Utility.formatResponse(200, `Updated Successfully`)));
                            })
                            .catch(err => {
                                reject(res.status(500).send(Utility.formatResponse(500, err)));
                            });
                    } else {
                        resolve(res.status(404).send(Utility.formatResponse(404, `Country Not Found`)));
                    };
                })
                .catch(err => {
                    reject(res.status(500).send(Utility.formatResponse(500, err)));
                });
        });
    },

    removeCountry: (req, res) => {
        return new Promise((resolve, reject) => {
            console.log("enter")
            CountryModel.findByPk(req.params.id)
                .then(country => {
                    if (country) {
                        const removeUserObject = { ...country };
                        CountryModel.destroy({ where: { id: req.params.id } })
                            .then(deletedData => {
                                resolve(res.status(200).send(Utility.formatResponse(200, `Deleted Successfully`)));
                            })
                            .catch(err => {
                                reject(res.status(500).send(Utility.formatResponse(500, err)));
                            });
                    } else {
                        resolve(res.status(404).send(Utility.formatResponse(404, `Country Not Found`)));
                    };
                })
                .catch(err => {
                    reject(res.status(500).send(Utility.formatResponse(500, err)));
                });
        });
    },
}

module.exports = countryController;

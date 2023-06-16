/**
 * Copyright © 2023, Eden Sign Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of Eden Sign Inc., and is licensed as
 * restricted rights software. The use, reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with Eden Sign.
 */

const Sequelize = require("sequelize");

const CountryModel = require("../../model/country");
const Utility = require("../../utility/index");

const countryController = {
  /** Get countries from database based on query type search if provided
   */
  getCountries: (req, res) => {
    return new Promise((resolve, reject) => {
      CountryModel.findAll()
        .then((list) => {
          if (list.length > 0) {
            resolve(
              res.status(200).send(Utility.formatResponse(200, { list }))
            );
          } else {
            resolve(
              res.status(404).send(Utility.formatResponse(404, `No Data Found`))
            );
          }
        })
        .catch((err) => {
          reject(res.status(500).send(Utility.formatResponse(500, err)));
        });
    });
  },
  /** Creating a new country record in the database.*/
  createCountry: (req, res) => {
    return new Promise((resolve, reject) => {
      const payload = req.body;
      CountryModel.create({ ...payload, created_by: req.body.id })
        .then((country) => {
          resolve(
            res.status(200).send(Utility.formatResponse(200, { country }))
          );
        })
        .catch((err) => {
          resolve(
            res
              .status(409)
              .send(Utility.formatResponse(409, `${err.errors[0].message}`))
          );
        });
    });
  },

  /** Finding country in database, if found then updating it with newly entered data.*/
  updateCountry: (req, res) => {
    return new Promise((resolve, reject) => {
      CountryModel.findByPk(req.params.id)
        .then((country) => {
          if (country) {
            const updatedCountryObject = { ...country, ...req.body };
            CountryModel.update(
              { ...updatedCountryObject },
              { where: { id: req.params.id } }
            )
              .then((updatedData) => {
                resolve(
                  res
                    .status(200)
                    .send(Utility.formatResponse(200, `Updated Successfully`))
                );
              })
              .catch((err) => {
                reject(res.status(500).send(Utility.formatResponse(500, err)));
              });
          } else {
            resolve(
              res
                .status(404)
                .send(Utility.formatResponse(404, `Country Not Found`))
            );
          }
        })
        .catch((err) => {
          reject(res.status(500).send(Utility.formatResponse(500, err)));
        });
    });
  },

  /** Finding the matched id record of country in database, if found then deleting the particular record.*/
  removeCountry: (req, res) => {
    return new Promise((resolve, reject) => {
      CountryModel.findByPk(req.params.id)
        .then((country) => {
          if (country) {
            CountryModel.destroy({ where: { id: req.params.id } })
              .then((deletedData) => {
                resolve(
                  res
                    .status(200)
                    .send(Utility.formatResponse(200, `Deleted Successfully`))
                );
              })
              .catch((err) => {
                reject(res.status(500).send(Utility.formatResponse(500, err)));
              });
          } else {
            resolve(
              res
                .status(404)
                .send(Utility.formatResponse(404, `Country Not Found`))
            );
          }
        })
        .catch((err) => {
          reject(res.status(500).send(Utility.formatResponse(500, err)));
        });
    });
  },
};

module.exports = countryController;

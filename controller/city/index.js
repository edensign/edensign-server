/**
 * Copyright © 2023, Eden Sign Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of Eden Sign Inc., and is licensed as
 * restricted rights software. The use, reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with Eden Sign.
 */

const Sequelize = require("sequelize");

const CityModel = require("../../model/city");
const Utility = require("../../utility/index");

const cityController = {
  /** Creating city in the database
 */
  createCity: (req, res) => {
    return new Promise((resolve, reject) => {
      const payload = req.body;
      CityModel.create({ ...payload, created_by: req.body.id })
        .then((city) => {
          resolve(res.status(200).send(Utility.formatResponse(200, { city })));
        })
        .catch((err) => {
          resolve(res.status(409).send(Utility.formatResponse(409, `${err.errors[0].message}`)));
        });
    });
  },
  /** Get cities from database
   */
  getCities: (req, res) => {
    return new Promise((resolve, reject) => {
      CityModel.findAll({ where: { state_id: req.params.id } })
        .then(list => {
          (list.length > 0) ?
            resolve(res.status(200).send(Utility.formatResponse(200, { list })))
            :
            resolve(res.status(404).send(Utility.formatResponse(404, `No Data Found`)));
        })
        .catch(err => {
          reject(res.status(500).send(Utility.formatResponse(500, err)));
        });
    });
  },
  /** Updating city in database
   */
  updateCity: (req, res) => {
    return new Promise((resolve, reject) => {
      const updatedCityObject = { ...city, ...req.body };
      CityModel.update(
        { ...updatedCityObject },
        { where: { id: req.params.id } }
      )
        .then((updatedData) => {
          resolve(res.status(200).send(Utility.formatResponse(200, `Updated Successfully`)));
        })
        .catch((err) => {
          reject(res.status(500).send(Utility.formatResponse(500, err)));
        });
    });
  },

  /** Finding the matched id record of city in database then deleting the particular record
  */
  removeCity: (req, res) => {
    return new Promise((resolve, reject) => {
      CityModel.findByPk(req.params.id)
        .then((city) => {
          if (city) {
            CityModel.destroy({ where: { id: req.params.id } })
              .then((deletedData) => {
                resolve(res.status(200).send(Utility.formatResponse(200, `Deleted Successfully`)));
              })
              .catch((err) => {
                reject(res.status(500).send(Utility.formatResponse(500, err)));
              });
          } else {
            resolve(res.status(404).send(Utility.formatResponse(404, `City Not Found`)));
          }
        })
        .catch((err) => {
          reject(res.status(500).send(Utility.formatResponse(500, err)));
        });
    });
  }
};

module.exports = cityController;

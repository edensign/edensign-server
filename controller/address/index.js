/**
 * Copyright © 2023, Eden Sign Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of Eden Sign Inc., and is licensed as
 * restricted rights software. The use, reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with Eden Sign.
 */

const AddressModel = require("../../model/address");
const Utility = require("../../utility");

const addressController = {
    /** Create address in the database
     */
    create: (req, res) => {
        const payload = req.body;
        return new Promise((resolve, reject) => {
            AddressModel.create({ ...payload, created_by: req.body.userId })
                .then(address => {
                    resolve(res.status(200).send(Utility.formatResponse(200, `Success`)));
                })
                .catch(err => {
                    resolve(res.status(409).send(Utility.formatResponse(409, "Error")));
                });
        });
    },
    /** Get address from the database
     */
    getAddress: (req, res) => {
        return new Promise((resolve, reject) => {
            AddressModel.findOne({ where: { parent: req.params.parent, parent_id: req.params.parent_id } })
                .then(data => {
                    !data ?
                        resolve(res.status(404).send(Utility.formatResponse(404, `Data Not Found`)))
                        :
                        resolve(res.status(200).send(Utility.formatResponse(200, data)));
                })
                .catch(err => {
                    reject(res.status(500).send(Utility.formatResponse(500, err)));
                });
        });
    },
    /** Updating address in the database
     */
    updateAddress: (req, res) => {
        return new Promise((resolve, reject) => {
            const payload = req.body;
            AddressModel.update({ ...payload, updated_by: req.body.userId },
                { where: { parent: req.body.parent, parent_id: req.body.parent_id } })
                .then(updatedData => {
                    resolve(res.status(200).send(Utility.formatResponse(200, `Updated Successfully`)));
                })
                .catch(err => {
                    reject(res.status(500).send(Utility.formatResponse(500, err)));
                });
        });
    }
};

module.exports = addressController;

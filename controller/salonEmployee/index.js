/**
 * Copyright © 2023, Eden Sign Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of Eden Sign Inc., and is licensed as
 * restricted rights software. The use, reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with Eden Sign.
 */

const SalonEmployeeModel = require("../../model/salonEmployee");
const Utility = require("../../utility");

const SalonEmployeeController = {
    /** Finding salon in the database from user id that is received
     */
    getBySalonId: (req, res) => {
        return new Promise((resolve, reject) => {
            SalonEmployeeModel.findAll({ where: { salon_id: req.params.salon_id } })
                .then(salon_employee => {
                    salon_employee ?
                        resolve(res.status(200).send(Utility.formatResponse(200, salon_employee)))
                        :
                        resolve(res.status(404).send(Utility.formatResponse(404, `No Data Found`)));
                })
                .catch(err => {
                    reject(res.status(500).send(Utility.formatResponse(500, err)));
                });
        });
    },
    /** Create salon employee in the database
     */
    createSalonEmployee: (req, res) => {
        const payload = req.body;
        console.log("Payload=>", { ...payload });
        return new Promise((resolve, reject) => {
            SalonEmployeeModel.create({ ...payload, created_by: payload.userId })
                .then(employee => {
                    resolve(res.status(200).send(Utility.formatResponse(200, `Success`)));
                })
                .catch(err => {
                    console.log("Error=>", err)
                    resolve(res.status(409).send(Utility.formatResponse(409, "Error")));
                });
        });
    },
    /** Updating salon employee in the database based on parent
     */
    updateSalonEmployee: (req, res) => {
        return new Promise((resolve, reject) => {
            const payload = req.body;
            console.log("Payload=>", payload)   //{where: {salon_id: payload.salon_id}}  why this not work
            SalonEmployeeModel.update({ ...payload, updated_by: payload.userId }, { where: { id: payload.id } })
                .then(updatedData => {
                    resolve(res.status(200).send(Utility.formatResponse(200, `Updated Successfully`)));
                })
                .catch(err => {
                    console.log("err=>", err)
                    reject(res.status(500).send(Utility.formatResponse(500, err)));
                });
        });
    },

    /** Get salon employees from the salon_employee table in the database, this api is for edensign website
     */
    getSalonEmployee: (req, res) => {
        return new Promise((resolve, reject) => {
            const service_id = req.body.service_id;
            const queryString = `SELECT se.id, se.name, salon.services FROM salon_employee  se
                                    LEFT OUTER JOIN salon ON se.salon_id = salon.id
                                    WHERE salon.salon_code = '${req.body.code}'
                                    AND FIND_IN_SET('${service_id}', REPLACE(se.services, ', ',','))`;

            Utility.executeQuery(queryString)
                .then(response => {
                    console.log("Response=>", response)
                    response ?
                        resolve(res.status(200).send(Utility.formatResponse(200, response)))
                        :
                        resolve(res.status(404).send(Utility.formatResponse(404, `No Data Found`)));
                })
                .catch(err => {
                    reject(res.status(500).send(Utility.formatResponse(500, err)));
                });
        });
    }
};

module.exports = SalonEmployeeController;

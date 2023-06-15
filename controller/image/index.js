/**
 * Copyright © 2023, Eden Sign Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of Eden Sign Inc., and is licensed as
 * restricted rights software. The use, reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with Eden Sign.
 */

const ImageModel = require("../../model/image");
const Utility = require("../../utility");

const ImageController = {
    /** */
    create: (req, res) => {
        const payload = req.body;
        return new Promise((resolve, reject) => {
            ImageModel.create({ ...payload })
                .then(image => {
                    resolve(res.status(200).send(Utility.formatResponse(200, `Success`)));
                })
                .catch(err => {
                    resolve(res.status(409).send(Utility.formatResponse(409, "Error")));
                });
        });
    },
    /** Get Image from database
     */
    getImage: (req, res) => {
        return new Promise((resolve, reject) => {
            ImageModel.findOne({ where: { parent: req.params.parent, parent_id: req.params.parent_id } })
                .then(data => {
                    console.log("GETIMAGE THEN LOG OD DATA=>", data)
                    !data ?
                        resolve(res.status(404).send(Utility.formatResponse(404, `Data Not Found`)))
                        :
                        resolve(res.status(200).send(Utility.formatResponse(200, data)));
                })
                .catch(err => {
                    console.log("GETIMAGE CATCH LOG OD DATA=>", err)
                    reject(res.status(500).send(Utility.formatResponse(500, err)));
                });
        });
    },
    /** Updating Image of a particular user in the database
     */
    updateImage: (req, res) => {
        return new Promise((resolve, reject) => {
            const payload = req.body;
            ImageModel.update({ ...payload, updated_by: req.body.userId },
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

module.exports = ImageController;

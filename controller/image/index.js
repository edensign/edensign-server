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
    /** Get image/images from database based on parent
     */
    getImage: (req, res) => {
        return new Promise((resolve, reject) => {
            ImageModel.findAll({ where: { parent: req.params.parent, parent_id: req.params.parent_id } })
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
    /** Create new image
     */
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
    /** Updating image in the database based on parent
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

/**
 * Copyright © 2023, Eden Sign Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of Eden Sign Inc., and is licensed as
 * restricted rights software. The use, reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with Eden Sign.
 */

const ProductImageModel = require("../../model/productImage");
const Utility = require("../../utility");
// const uploadingImage = require("../../utility/uploadImageToAzure");

const ProductImageController = {
    /** Get product image/images from database based on parent_id
     */
    getProductImage: (req, res) => {
        return new Promise((resolve, reject) => {
            ProductImageModel.findAll({
                where: { parent_id: req.params.parent_id },
                order: [
                    ["priority", "DESC"]
                ]
            })
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
    /** Create new product image
     */
    create: (req, res) => {
        const payload = req.body;
        return new Promise((resolve, reject) => {
            ProductImageModel.create({ ...payload, created_by: req.body.userId })
                .then(image => {
                    resolve(res.status(200).send(Utility.formatResponse(200, `Success`)));
                })
                .catch(err => {
                    resolve(res.status(409).send(Utility.formatResponse(409, "Error")));
                });
        });
    },
    /** Updating product image in the database
     */
    updateProductImage: (req, res) => {
        return new Promise((resolve, reject) => {
            const payload = req.body;
            ProductImageModel.update({ ...payload, updated_by: req.body.userId },
                { where: { parent_id: payload.parent_id } })
                .then(updatedData => {
                    resolve(res.status(200).send(Utility.formatResponse(200, `Updated Successfully`)));
                })
                .catch(err => {
                    reject(res.status(500).send(Utility.formatResponse(500, err)));
                });
        });
    },
    /** Delete product images from the db */
    deleteProductImage: (req, res) => {
        return new Promise((resolve, reject) => {
            const payload = req.body;
            ProductImageModel.destroy({ where: { parent_id: payload.parent_id } })
                .then(deletedImage => {
                    resolve(res.status(200).send(Utility.formatResponse(200, `Deleted Successfully`)));
                })
                .catch(err => {
                    reject(res.status(500).send(Utility.formatResponse(500, err)));
                });
        });
    },
    /** Upload product image to abs
    */
    uploadProductImage: (req, res) => {
        return new Promise((resolve, reject) => {
            Utility.uploadingImageToAzure(req.body.folder, req.files.file.data, req.body.name)
                .then(upload => {
                    resolve(res.status(200).send(Utility.formatResponse(200, `Uploaded Successfully`)));
                })
                .catch(err => {
                    reject(res.status(500).send(Utility.formatResponse(500, err)));
                });
        });
    }
};

module.exports = ProductImageController;

/**
 * Copyright © 2023, Eden Sign Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of Eden Sign Inc., and is licensed as
 * restricted rights software. The use, reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with Eden Sign.
 */

const { Op } = require("sequelize");

const ProductModel = require("../../model/product");
const Utility = require("../../utility");

const productController = {
    /** Get products from database based on query type, page, size and search if provided
     */
    getProducts: (req, res) => {
        const { page, size, search } = req.query;
        const { limit, offset } = Utility.getPagination(parseInt(page), parseInt(size));

        return new Promise((resolve, reject) => {
            let searchCond = {};
            if (search) {
                searchCond = {
                    [Op.or]: [
                        {
                            name: {
                                [Op.like]: `%${search}%`
                            }
                        },
                        {
                            brand: {
                                [Op.like]: `%${search}%`
                            }
                        },
                        {
                            color: {
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
            ProductModel.findAndCountAll({
                limit, offset, where: { ...searchCond }, order: [
                    ["updated_at", "DESC"]
                ]
            })
                .then(list => {
                    const { count, rows } = list;
                    (count > 0) ?
                        resolve(res.status(200).send(Utility.formatResponse(200, { count, rows })))
                        :
                        resolve(res.status(404).send(Utility.formatResponse(404, `No Data Found`)));
                })
                .catch(err => {
                    reject(res.status(500).send(Utility.formatResponse(500, err)));
                });
        });
    },
    /** Creating product in the database
    */
    createProduct: (req, res) => {
        return new Promise((resolve, reject) => {
            const payload = req.body;
            ProductModel.create({ ...payload, created_by: req.body.userId })
                .then(product => {
                    resolve(res.status(200).send(Utility.formatResponse(200, { id: product.id })));
                })
                .catch(err => {
                    resolve(res.status(409).send(Utility.formatResponse(409, `${err.errors[0].message}`)));
                });     //`${err.errors[0].message}`  this was added when it was sequelize constraint error
        });
    },
    /** Updating product in the database
     */
    updateProduct: (req, res) => {
        return new Promise((resolve, reject) => {
            const payload = req.body;
            ProductModel.update({ ...payload, updated_by: req.body.userId }, { where: { id: req.body.id } })
                .then(updatedData => {
                    resolve(res.status(200).send(Utility.formatResponse(200, `Updated Successfully`)));
                })
                .catch(err => {
                    reject(res.status(500).send(Utility.formatResponse(500, err)));
                });
        });
    },
    /** API for the  edensign
     * website  */
    getProductList: (req, res) => {
        return new Promise(async (resolve, reject) => {
            const queryString = `SELECT product.id, product.name, product.brand, product.price, product.color, product.capacity, product.description,
            product.discount_percent, product.discounted_price, product.is_home,
             product.is_bestseller, product.status
             FROM product
             GROUP BY
            product.id, product.name, product.brand, product.price, product.color, product.capacity, product.description, 
            product.discount_percent, product.discounted_price, product.is_home, product.is_bestseller, product.status`;
            Utility.executeQuery(queryString)
                .then(data => {
                    data ?
                        resolve(res.status(200).send(Utility.formatResponse(200, data)))
                        :
                        resolve(res.status(404).send(Utility.formatResponse(404, `No Data Found`)));
                })
                .catch(err => {
                    reject(res.status(500).send(Utility.formatResponse(500, err)));
                });
        })
    },
    /** Get inventory data - products with stock information
     */
    getInventory: (req, res) => {
        const { page, size, search } = req.query;
        const { limit, offset } = Utility.getPagination(parseInt(page), parseInt(size));

        return new Promise((resolve, reject) => {
            let searchCond = {};
            if (search) {
                searchCond = {
                    [Op.or]: [
                        {
                            name: {
                                [Op.like]: `%${search}%`
                            }
                        },
                        {
                            sku: {
                                [Op.like]: `%${search}%`
                            }
                        },
                        {
                            brand: {
                                [Op.like]: `%${search}%`
                            }
                        }
                    ]
                };
            }
            ProductModel.findAndCountAll({
                limit, offset,
                where: { ...searchCond },
                attributes: ['id', 'name', 'brand', 'sku', 'stock_quantity', 'low_stock_threshold', 'status', 'updated_at'],
                order: [
                    ["updated_at", "DESC"]
                ]
            })
                .then(list => {
                    const { count, rows } = list;
                    (count > 0) ?
                        resolve(res.status(200).send(Utility.formatResponse(200, { count, rows })))
                        :
                        resolve(res.status(404).send(Utility.formatResponse(404, `No Data Found`)));
                })
                .catch(err => {
                    reject(res.status(500).send(Utility.formatResponse(500, err)));
                });
        });
    },
    /** Update inventory stock for a product
     */
    updateInventory: (req, res) => {
        return new Promise((resolve, reject) => {
            const { id, stock_quantity, low_stock_threshold, sku } = req.body;
            const updateData = { updated_by: req.body.userId };

            if (stock_quantity !== undefined) updateData.stock_quantity = stock_quantity;
            if (low_stock_threshold !== undefined) updateData.low_stock_threshold = low_stock_threshold;
            if (sku !== undefined) updateData.sku = sku;

            ProductModel.update(updateData, { where: { id } })
                .then(updatedData => {
                    resolve(res.status(200).send(Utility.formatResponse(200, `Inventory Updated Successfully`)));
                })
                .catch(err => {
                    reject(res.status(500).send(Utility.formatResponse(500, err)));
                });
        });
    }
};

module.exports = productController;

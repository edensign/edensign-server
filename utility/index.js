/**
 * Copyright © 2023, Eden Sign Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of Eden Sign Inc., and is licensed as
 * restricted rights software. The use,reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with Eden Sign.
 */

const bcrypt = require("bcryptjs");
const { BlobServiceClient } = require("@azure/storage-blob");
const jwt = require("jsonwebtoken");
const Sequelize = require("sequelize");

const config = require("../config");
const sequelize = require("../sequelize");

const salt = config.SALT;
const secret = config.SECRET;
const sasURL = config.IMAGE_CONTAINER_SAS_URL;

const blobServiceClient = new BlobServiceClient(sasURL);

const Utility = {
    /**
     * Creating hash of password by combining salt
     * @param {String} password
     * @return {String} encrypted password
     */
    createHash: password => {
        return new Promise((resolve, reject) => {
            bcrypt.hash(password, salt, (err, hash) => {
                err ? reject(err) : resolve(hash);
            });
        });
    },
    /**
     * Get signed token
     * @param {Integer} id userId
     * @return {String} auth token
     */
    getSignedToken: id => {
        return jwt.sign({ id: id }, secret, {
            expiresIn: 86400
        });
    },
    /**
     * Comparing 2 passwords
     * @param {String} password
     * @param {String} hash
     * @return {Boolean} true/false 
     */
    comparePassword: (password, hash) => {
        return new Promise((resolve, reject) => {
            bcrypt.compare(password, hash, (err, isMatch) => {
                err ? reject(err) : resolve(isMatch);
            });
        });
    },
    /**
     * Formatting the response with status code
     * @param {Integer} statusCode
     * @param {Object/String} res
     * @return {Object} formatted api response
     */
    formatResponse: (statusCode, res) => {
        let status = '';
        switch (statusCode) {
            case 200:
            case 202:
            case 204:
                status = `Success`;
                break;
            case 400:
            case 401:
            case 403:
            case 404:
            case 408:
            case 409:
            case 429:
            case 500:
            case 502:
            case 503:
            case 505:
                status = "Error";
                break;
            default:
                status = "Success";
                break;
        };
        return status === 'Success' ? {
            status,
            data: res
        } : {
            status,
            msg: res
        };
    },
    /** Middleware to verify x-access-token
     */
    verifyToken: (req, res, next) => {
        return new Promise((resolve, reject) => {

            const type = req.headers['type'];
            if (type === "admin") {
                const token = req.headers['x-access-token'];
                if (!token) {
                    resolve(res.status(401).send(Utility.formatResponse(401, `No Token Provided`)));
                }
                else {
                    jwt.verify(token, secret, (err, decoded) => {
                        try {
                            req.body.userId = decoded.id;
                            resolve(next());
                        } catch (err) {
                            resolve(res.status(500).send(Utility.formatResponse(500, `Failed To Authenticate Token`)));
                        };
                    });
                }
            } else {
                resolve(next());
            }
        });
    },
    /**
     * Get Schema Model according to tableName
     * @param {String} tableName 
     * @return {Object} Schema Model
     */
    getModel: (tableName) => {
        let model;
        switch (tableName) {
            case 'users':
                model = require("../model/user");
                break;
            case 'salon':
                model = require("../model/salon");
                break;
            case 'amenity':
                model = require("../model/amenity");
                break;
            case 'service':
                model = require("../model/service");
                break;
            default:
                break;
        };
        return model;
    },
    /**
     * Get API limit and offset
     * @param {Integer} page
     * @param {Integer} size
     * @return {Object} object containing limit and offset
     */
    getPagination: (page = 0, size = 5) => {
        let limit = size;
        let offset = page * size;
        return { limit, offset }
    },
    /**
     * Format sql query by adding type attribute
     * @param {String} query
     * @return {Object} object containing the query with type
     */
    executeQuery: (queryString) => {
        return sequelize.query(queryString, { type: Sequelize.QueryTypes.SELECT });
    },
    /**
     * Upload image to azure blob storage
     * @param {Buffer} file
     * @param {String} name
     * @return {String} bytes of data saved on azure 
     */
    uploadingImageToAzure: async (folderName, file, formattedName) => {
        /** Uploads the given image in the specified azure container 
         */
        try {
            const containerClient = blobServiceClient.getContainerClient(folderName);
            const blobClient = containerClient.getBlobClient(formattedName);
            const blockBlobClient = blobClient.getBlockBlobClient();
            const result = await blockBlobClient.uploadData(file, {
                blockSize: 4 * 1024 * 1024,       // 4 MiB max block size
                concurrency: 20,                 // maximum number of parallel transfer workers
                onProgress: ev => console.log("Azure Storage Result=>", ev)
            });
        } catch (error) {
            throw error;
        }
    }
};

module.exports = Utility;

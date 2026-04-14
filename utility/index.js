/**
 * Copyright © 2023, Eden Sign Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of Eden Sign Inc., and is licensed as
 * restricted rights software. The use,reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with Eden Sign.
 */

const bcrypt = require("bcryptjs");
const { BlobServiceClient } = require("@azure/storage-blob");

const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const jwt = require("jsonwebtoken");
const Sequelize = require("sequelize");

const config = require("../config");
const sequelize = require("../sequelize");

const salt = config.SALT;
const secret = config.SECRET;
const bucketName = config.BUCKET;
const region = config.REGION;
const accessKey = config.ACCESS_KEY;
const secretKey = config.SECRET_KEY;

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
            let token = req.headers['x-access-token'];

            // Check for Bearer token if x-access-token is missing (common for mobile apps)
            if (!token && req.headers['authorization']) {
                const authHeader = req.headers['authorization'];
                if (authHeader.startsWith('Bearer ')) {
                    token = authHeader.substring(7);
                }
            }

            if (!token) {
                // No token provided - for protected routes, reject
                const type = req.headers['type'];
                if (type === "admin") {
                    resolve(res.status(401).send(Utility.formatResponse(401, `No Token Provided`)));
                } else {
                    // For non-admin routes, allow but without userId
                    resolve(next());
                }
            } else {
                // Token provided - verify it and set userId
                jwt.verify(token, secret, (err, decoded) => {
                    if (err) {
                        resolve(res.status(401).send(Utility.formatResponse(401, `Failed To Authenticate Token`)));
                    } else {
                        req.userId = decoded.id;  // Set userId from token
                        req.body.userId = decoded.id;  // Also set in body for backwards compatibility
                        resolve(next());
                    }
                });
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
            case 'salon_employee':
                model = require("../model/salonEmployee");
                break;
            case 'job_seeker':
                model = require("../model/jobSeeker");
                break;
            case 'product':
                model = require("../model/product");
                break;
            case 'salon_inventory_product':
                model = require("../model/salonInventoryProduct");
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
    getPagination: (page, size) => {
        let _page = (page !== undefined && !Number.isNaN(page) && page >= 0) ? page : 0;
        let _size = (size !== undefined && !Number.isNaN(size) && size > 0) ? size : 100;
        let limit = _size;
        let offset = _page * _size;
        return { limit, offset };
    },
    /**
     * Format sql query by adding type attribute
     * @param {String} query
     * @return {Object} object containing the query with type
     */
    executeQuery: (queryString) => {
        return sequelize.query(queryString, { type: Sequelize.QueryTypes.SELECT });
    },

    // upload the document to aws s3 bucket
    uploadToS3: async (folder, file, res) => {
        console.log('folder', folder, file);
        // Initialize an S3 client instance
        const s3Client = new S3Client({
            region: region,
            credentials: {
                accessKeyId: accessKey,
                secretAccessKey: secretKey,
            },
        });

        // Set the parameters for the file you want to upload
        const params = {
            Bucket: bucketName,
            Key: folder,
            Body: file.data,
            ContentType: file.mimetype,
        };

        try {
            // Upload the file to S3 using the PutObjectCommand
            const data = await s3Client.send(new PutObjectCommand(params));
            console.log("data", data)

            // The uploaded file URL will need to be manually constructed since v3 doesn't directly return a location
            const fileLocation = `https://${bucketName}.s3.${region}.amazonaws.com/${folder}`;

            console.log('File uploaded successfully. File location:', fileLocation);
            return res.status(200).send(Utility.formatResponse(200, fileLocation));
        } catch (err) {
            console.log('Error uploading file:', err);
            return res.status(500).send(
                Utility.formatResponse(500, 'Error occurred while uploading the file')
            );
        }
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

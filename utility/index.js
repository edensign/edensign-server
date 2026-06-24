/**
 * Copyright © 2023, Eden Sign Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of Eden Sign Inc., and is licensed as
 * restricted rights software. The use,reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with Eden Sign.
 */

const bcrypt = require("bcryptjs");
const { BlobServiceClient } = require("@azure/storage-blob");
const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const jwt = require("jsonwebtoken");

const config = require("../config");
const supabase = require("../supabase");

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
            expiresIn: '30d'
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
                const type = req.headers['type'];
                if (type === "admin") {
                    resolve(res.status(401).send(Utility.formatResponse(401, `No Token Provided`)));
                } else {
                    resolve(next());
                }
            } else {
                jwt.verify(token, secret, (err, decoded) => {
                    if (err) {
                        resolve(res.status(401).send(Utility.formatResponse(401, `Failed To Authenticate Token`)));
                    } else {
                        req.userId = decoded.id;
                        req.body.userId = decoded.id;
                        resolve(next());
                    }
                });
            }
        });
    },
    /**
     * Get Schema table name for getByPk common endpoint
     * @param {String} tableName
     * @return {String} validated table name
     */
    getValidTable: (tableName) => {
        const allowed = [
            'users', 'salon', 'amenity', 'service', 'salon_employee',
            'job_seeker', 'product', 'salon_inventory_product', 'digital_offers',
            'state', 'city', 'category', 'company', 'distributor'
        ];
        return allowed.includes(tableName) ? tableName : null;
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
     * Execute a Supabase RPC (replaces raw Sequelize executeQuery)
     * @param {String} fnName  - Supabase function name
     * @param {Object} params  - Parameters object
     * @return {Array} result rows
     */
    executeRpc: async (fnName, params = {}) => {
        const { data, error } = await supabase.rpc(fnName, params);
        if (error) throw error;
        return data;
    },

    // Upload to AWS S3
    uploadToS3: async (folder, file, res) => {
        try {
            console.log("Initializing S3 with region:", config.REGION);
            const s3Client = new S3Client({
                region: config.REGION,
                credentials: {
                    accessKeyId: config.ACCESS_KEY,
                    secretAccessKey: config.SECRET_KEY
                }
            });

            const command = new PutObjectCommand({
                Bucket: config.BUCKET,
                Key: folder,
                Body: file.data,
                ContentType: file.mimetype
            });

            await s3Client.send(command);

            const fileLocation = `https://${config.BUCKET}.s3.${config.REGION}.amazonaws.com/${folder}`;
            return res.status(200).send(Utility.formatResponse(200, fileLocation));
        } catch (err) {
            console.error("uploadToS3 error:", err);
            return res.status(500).send(Utility.formatResponse(500, 'Error occurred while uploading the file'));
        }
    },

    // Delete from AWS S3
    deleteFromS3: async (key) => {
        try {
            const s3Client = new S3Client({
                region: config.REGION,
                credentials: {
                    accessKeyId: config.ACCESS_KEY,
                    secretAccessKey: config.SECRET_KEY
                }
            });

            const command = new DeleteObjectCommand({
                Bucket: config.BUCKET,
                Key: key
            });

            await s3Client.send(command);
            console.log(`Successfully deleted key ${key} from S3`);
            return true;
        } catch (err) {
            console.error("deleteFromS3 error:", err);
            return false;
        }
    },

    /**
     * Upload image to azure blob storage
     */
    uploadingImageToAzure: async (folderName, file, formattedName) => {
        try {
            const containerClient = blobServiceClient.getContainerClient(folderName);
            const blobClient = containerClient.getBlobClient(formattedName);
            const blockBlobClient = blobClient.getBlockBlobClient();
            await blockBlobClient.uploadData(file, {
                blockSize: 4 * 1024 * 1024,
                concurrency: 20,
                onProgress: ev => console.log("Azure Storage Result=>", ev)
            });
        } catch (error) {
            throw error;
        }
    }
};

module.exports = Utility;

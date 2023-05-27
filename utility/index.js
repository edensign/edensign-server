/**
 * Copyright © 2023, Eden Sign Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of Eden Sign Inc., and is licensed as
 * restricted rights software. The use,reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with Eden Sign.
 */

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../config");

const salt = config.SALT;
const secret = config.SECRET;


const Utility = {
    /**
     * Creating hash of password by combining salt
     * @param {String} password
     * @return {String} encrypted password
     */
    createHash: password => {
        return new Promise((resolve, reject) => {
            bcrypt.hash(password, salt, (err, hash) => {
                if (err) reject(err);
                else resolve(hash);
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
                if (err) reject(err);
                else resolve(isMatch);
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
            };
        });
    },
    /**
     * Get Schema Model according to tableName
     * @param {string} tableName 
     * @return {Object} Schema Model
     */
    getModel: (tableName) => {
        let model;
        switch (tableName) {
            case 'users':
                model = require("../model/user");
                break;
            default:
                break;
        };
        return model;
    }
};

module.exports = Utility;

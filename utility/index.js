const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../config");

const salt = config.SALT;
const secret = config.SECRET;


const Utility = {
    createHash: password => {
        return new Promise((resolve, reject) => {
            bcrypt.hash(password, salt, (err, hash) => {
                if (err) reject(err);
                else resolve(hash);
            })
        })
    },
    getSignedToken: id => {
        return jwt.sign({ id: id }, secret, {
                expiresIn: 86400
            })
    },
    comparePassword: (password, hash) => {
        return new Promise((resolve, reject) => {
            bcrypt.compare(password, hash, (err, isMatch) => {
                if (err) reject(err)
                else resolve(isMatch)
            })
        })
    },
    verifyToken: (req, res, next) => {
        return new Promise((resolve, reject) => {
            const token = req.headers['x-access-token'];
            if (!token) {
                reject(res.status(401).send({ auth: false, msg: "No Token Provided" }))
            } else {
                jwt.verify(token, secret, (err, decoded) => {
                    if (err) {
                        reject(res.status(500).send({ auth: false, msg: "Failed To Authenticate Token" }))
                    } else {
                        req.body.userId = decoded.id;
                        resolve(next())
                    }
                })
            }
        })
    }
}

module.exports = Utility;

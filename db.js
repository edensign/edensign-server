/**
 * Copyright © 2023, Eden Sign Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of Eden Sign Inc., and is licensed as
 * restricted rights software. The use,reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with Eden Sign.
 */

const sequelize = require("./sequelize");

let db;
/** 
 * Connects to the database
 * @return {Object} connection object
 */
const connectToMysql = () => {
    if (!db) {
        db = sequelize.authenticate()
            .then(() => {
                return "Connected To Database Successfully!";
            })
            .catch(err => {
                throw new Error("Error Connecting To Database ", err);
            })
    }
    return db;
};

//Calling the function at export
module.exports = connectToMysql();

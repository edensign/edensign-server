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
                console.log("Connected To Database Successfully!")
            })
            .catch((err) => {
                console.log("Error Connecting To Database ", err)
            })
    }
    return db;
}

//Calling the function at export
module.exports = connectToMysql();

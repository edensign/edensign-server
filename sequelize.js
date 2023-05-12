const Sequelize = require("sequelize");
const config = require("./config");

/**
 * Specifying database configurations
 * @param  {String} database name
 * @param  {String} username
 * @param  {String} password
 * @param  {Object} cofiguration
 * @return {Object} sequelize object
 */
const sequelize = new Sequelize(config.DB, config.DB_USERNAME, config.DB_PASSWORD, {
    host: config.HOST,
    port: config.DB_PORT,
    dialect: "mysql"    //explicitly specifying mysql database
});

module.exports = sequelize;

const Sequelize = require("sequelize")

/**
 * Specifying database configurations
 * @param  {String} database name
 * @param  {String} username
 * @param  {String} password
 * @param  {Object} cofiguration
 * @return {Object} sequelize object
 */
const sequelize = new Sequelize('eden-sign', 'root', '', {
    host: "localhost",
    port: 3306,
    dialect: "mysql"    //explicitly specifying mysql database
})

module.exports = sequelize;

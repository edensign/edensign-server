const dotenv = require('dotenv');
const path = require('path');

dotenv.config({
    path: path.resolve(__dirname, `${process.env.NODE_ENV}.env`)
});

module.exports = {
    NODE_ENV : process.env.NODE_ENV || 'local',
    HOST : process.env.HOST || 'localhost',
    PORT : process.env.PORT || 5000,
    DB_PORT : process.env.DB_PORT || 3306,
    DB : process.env.DB || 'eden-sign',
    USERNAME : process.env.USERNAME || 'root',
    PASSWORD : process.env.PASSWORD || ''
}
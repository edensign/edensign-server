const dotenv = require('dotenv');
const path = require('path');

dotenv.config({
    path: path.resolve(__dirname, `${process.env.NODE_ENV}.env`)
});

module.exports = {
    NODE_ENV : process.env.NODE_ENV || 'local',
    PORT : process.env.PORT || 5000,
    HOST : process.env.HOST || 'localhost',
    DB : process.env.DB || 'eden-sign',
    DB_PORT : process.env.DB_PORT || 3306,
    DB_USERNAME : process.env.DB_USERNAME || 'root',
    DB_PASSWORD : process.env.DB_PASSWORD || '',
    SECRET : process.env.SECRET || "EdEn@@#12sIgN",
    SALT : process.env.SALT || 16
};

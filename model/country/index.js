/**
 * Copyright © 2023, Eden Sign Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of Eden Sign Inc., and is licensed as
 * restricted rights software. The use,reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with Eden Sign.
 */

const Sequelize = require("sequelize");
const sequelize = require("../../sequelize");

const CountryModel = sequelize.define(
    'country',        //table name
    {
        name: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true
        },
        country_code: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true
        },
        phone_code: {
            type: Sequelize.STRING,
            allowNull: false
        },
    },
    {
        timestamps: false,
        freezeTableName: true
    }
);

module.exports = CountryModel;

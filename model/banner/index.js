/**
 * Copyright © 2023, Eden Sign Inc. ALL RIGHTS RESERVED.
 */

const Sequelize = require("sequelize");
const sequelize = require("../../sequelize");

const BannerModel = sequelize.define(
    "banner",
    {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        image_url: {
            type: Sequelize.STRING,
            allowNull: false
        },
        link: {
            type: Sequelize.STRING
        },
        is_active: {
            type: Sequelize.BOOLEAN,
            defaultValue: true
        }
    },
    {
        timestamps: false,
        freezeTableName: true,
    }
);

// We sync table if it does not exist
BannerModel.sync({ force: false }).catch(console.error);

module.exports = BannerModel;

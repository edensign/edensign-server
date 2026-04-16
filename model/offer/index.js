/**
 * Copyright © 2023, Eden Sign Inc. ALL RIGHTS RESERVED.
 */

const Sequelize = require("sequelize");
const sequelize = require("../../sequelize");

const OfferModel = sequelize.define(
    "offer",
    {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        title: {
            type: Sequelize.STRING,
            allowNull: false
        },
        description: {
            type: Sequelize.TEXT
        },
        image_url: {
            type: Sequelize.STRING
        },
        discount_amount: {
            type: Sequelize.DECIMAL(10, 2)
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

OfferModel.sync({ force: false }).catch(console.error);

module.exports = OfferModel;

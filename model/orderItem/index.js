/**
 * Copyright © 2023, Eden Sign Inc. ALL RIGHTS RESERVED.
 */

const Sequelize = require("sequelize");
const sequelize = require("../../sequelize");

const OrderItemModel = sequelize.define(
    "order_item",
    {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        order_id: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        product_id: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        quantity: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        price: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: false
        }
    },
    {
        timestamps: false,
        freezeTableName: true,
    }
);

OrderItemModel.sync({ force: false }).catch(console.error);

module.exports = OrderItemModel;

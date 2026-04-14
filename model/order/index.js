/**
 * Copyright © 2023, Eden Sign Inc. ALL RIGHTS RESERVED.
 */

const Sequelize = require("sequelize");
const sequelize = require("../../sequelize");

const OrderModel = sequelize.define(
    "order",
    {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        customer_id: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        total_amount: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: false
        },
        status: {
            type: Sequelize.STRING,
            defaultValue: 'pending'
        },
        created_at: {
            type: 'TIMESTAMP',
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
    },
    {
        timestamps: false,
        freezeTableName: true,
    }
);

OrderModel.sync({ force: false }).catch(console.error);

module.exports = OrderModel;

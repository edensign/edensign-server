/**
 * Copyright © 2023, Eden Sign Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of Eden Sign Inc., and is licensed as
 * restricted rights software. The use, reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with Eden Sign.
 */

const Sequelize = require("sequelize");

const sequelize = require("../../sequelize");

const ProductModel = sequelize.define(
    "product",   //table name
    {
        name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        brand: {
            type: Sequelize.STRING,
            allowNull: false
        },
        price: {
            type: Sequelize.STRING
        },
        color: {
            type: Sequelize.STRING
        },
        capacity: {
            type: Sequelize.STRING
        },
        description: {
            type: Sequelize.STRING
        },
        is_home: {
            type: Sequelize.BOOLEAN
        },
        is_bestseller: {
            type: Sequelize.BOOLEAN
        },
        discounted_price: {
            type: Sequelize.FLOAT
        },
        discount_percent: {
            type: Sequelize.FLOAT
        },
        status: {
            type: Sequelize.ENUM,
            values: ['active', 'inactive']
        },
        stock_quantity: {
            type: Sequelize.DOUBLE,
            defaultValue: 0
        },
        low_stock_threshold: {
            type: Sequelize.DOUBLE,
            defaultValue: 10
        },
        sku: {
            type: Sequelize.STRING,
            unique: true
        },
        created_at: {
            type: 'TIMESTAMP'
        },
        updated_at: {
            type: 'TIMESTAMP'
        },
        created_by: {
            type: Sequelize.INTEGER
        },
        updated_by: {
            type: Sequelize.INTEGER
        }
    },
    {
        timestamps: false,
        freezeTableName: true,
    }
);

module.exports = ProductModel;

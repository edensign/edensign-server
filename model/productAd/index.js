/**
 * Copyright © 2023, Eden Sign Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of Eden Sign Inc., and is licensed as
 * restricted rights software. The use, reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with Eden Sign.
 */

const Sequelize = require("sequelize");

const sequelize = require("../../sequelize");
const ProductModel = require("../product");

const ProductAdModel = sequelize.define(
    "product_ad",   //table name
    {
        product_id: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        title: {
            type: Sequelize.STRING,
            allowNull: false
        },
        subtitle: {
            type: Sequelize.STRING
        },
        ad_budget: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0
        },
        start_date: {
            type: Sequelize.DATEONLY,
            allowNull: false
        },
        end_date: {
            type: Sequelize.DATEONLY,
            allowNull: false
        },
        status: {
            type: Sequelize.ENUM,
            values: ['active', 'paused', 'expired'],
            defaultValue: 'active'
        },
        click_count: {
            type: Sequelize.INTEGER,
            defaultValue: 0
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

// Define Association
ProductAdModel.belongsTo(ProductModel, { foreignKey: 'product_id' });

module.exports = ProductAdModel;

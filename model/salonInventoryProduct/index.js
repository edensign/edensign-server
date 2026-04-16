/**
 * Copyright © 2023, Eden Sign Inc. ALL RIGHTS RESERVED.
 */

const Sequelize = require("sequelize");
const sequelize = require("../../sequelize");

const SalonInventoryProductModel = sequelize.define(
    "salon_inventory_product",
    {
        salon_id: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        brand: {
            type: Sequelize.STRING,
            allowNull: false
        },
        stock_quantity: {
            type: Sequelize.DOUBLE,
            defaultValue: 0
        },
        low_stock_threshold: {
            type: Sequelize.DOUBLE,
            defaultValue: 10
        },
        usage_per_client: {
            type: Sequelize.DOUBLE,
            defaultValue: 0 // Weight units used per client
        },
        sku: {
            type: Sequelize.STRING,
            // unique: true // Scope uniqueness to salon? Or global? Let's make it unique for now.
        },
        status: {
            type: Sequelize.ENUM,
            values: ['active', 'inactive'],
            defaultValue: 'active'
        },
        created_by: {
            type: Sequelize.INTEGER // User ID of the salon/creator
        },
        created_at: {
            type: 'TIMESTAMP',
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updated_at: {
            type: 'TIMESTAMP',
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
    },
    {
        timestamps: false,
        freezeTableName: true,
    }
);

module.exports = SalonInventoryProductModel;

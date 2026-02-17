/**
 * Copyright © 2023, Eden Sign Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of Eden Sign Inc., and is licensed as
 * restricted rights software. The use, reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with Eden Sign.
 */

const Sequelize = require("sequelize");

const sequelize = require("../../sequelize");

const ReviewModel = sequelize.define(
    "review",   //table name
    {
        salon_id: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        customer_id: {
            type: Sequelize.INTEGER,
            allowNull: true
        },
        quality_of_service: {
            type: Sequelize.DECIMAL(2, 1),
            allowNull: false,
            defaultValue: 0
        },
        facilities: {
            type: Sequelize.DECIMAL(2, 1),
            allowNull: false,
            defaultValue: 0
        },
        staff: {
            type: Sequelize.DECIMAL(2, 1),
            allowNull: false,
            defaultValue: 0
        },
        flexibility: {
            type: Sequelize.DECIMAL(2, 1),
            allowNull: false,
            defaultValue: 0
        },
        value_of_money: {
            type: Sequelize.DECIMAL(2, 1),
            allowNull: false,
            defaultValue: 0
        },
        reason: {
            type: Sequelize.TEXT,
            allowNull: true
        },
        comments: {
            type: Sequelize.TEXT,
            allowNull: true
        },
        created_at: {
            type: 'DATETIME',
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
    },
    {
        timestamps: false,
        freezeTableName: true,
    }
);

module.exports = ReviewModel;

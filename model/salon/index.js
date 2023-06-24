/**
 * Copyright © 2023, Eden Sign Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of Eden Sign Inc., and is licensed as
 * restricted rights software. The use,reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with Eden Sign.
 */

const Sequelize = require("sequelize");

const sequelize = require("../../sequelize");

const SalonModel = sequelize.define(
    'salon',     //table name
    {
        name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        email: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        contact_no: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        area: {
            type: Sequelize.STRING
        },
        description: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        services: {
            type: Sequelize.STRING
        },
        policies: {
            type: Sequelize.STRING
        },
        cancellation_policy: {
            type: Sequelize.STRING
        },
        safety_measures: {
            type: Sequelize.STRING
        },
        amenities: {
            type: Sequelize.STRING
        },
        salon_code: {
            type: Sequelize.STRING
        },
        near_by: {
            type: Sequelize.STRING
        },
        priority: {
            type: Sequelize.INTEGER
        },
        occupancy: {
            type: Sequelize.INTEGER
        },
        staff_count: {
            type: Sequelize.INTEGER
        },
        is_home: {
            type: Sequelize.BOOLEAN
        },
        is_featured: {
            type: Sequelize.BOOLEAN
        },
        is_franchise: {
            type: Sequelize.BOOLEAN
        },
        is_selfowned: {
            type: Sequelize.BOOLEAN
        },
        is_subscribed: {
            type: Sequelize.BOOLEAN
        },
        type: {
            type: Sequelize.ENUM,
            values: ['male', 'female', 'unisex']
        },
        status: {
            type: Sequelize.ENUM,
            values: ['active', 'inactive']
        },
        closed_on: {
            type: Sequelize.ENUM,
            values: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
        },
        opening_time: {
            type: 'TIMESTAMP'
        },
        closing_time: {
            type: 'TIMESTAMP'
        },
        established_on: {
            type: Sequelize.DATE
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
        freezeTableName: true
    },
);

module.exports = SalonModel;

/**
 * Copyright © 2023, Eden Sign Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of Eden Sign Inc., and is licensed as
 * restricted rights software. The use,reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with Eden Sign.
 */

const Sequelize = require("sequelize");

const sequelize = require("../../sequelize");

const UserModel = sequelize.define(
    'users',     //table name
    {
        username: {
            type: Sequelize.STRING,
            allowNull: false
        },
        password: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true
        },
        email: {
            type: Sequelize.STRING,
            allowNull: false
        },
        contact_no: {
            type: Sequelize.STRING,
            allowNull: false
        },
        type: {
            type: Sequelize.ENUM,
            values: ['admin', 'salon', 'freelancer', 'sales_executive']
        },
        gender: {
            type: Sequelize.ENUM,
            values: ['male', 'female', 'other']
        },
        status: {
            type: Sequelize.ENUM,
            values: ['active', 'inactive']
        },
        agreement: {
            type: Sequelize.BOOLEAN
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
    }
);

module.exports = UserModel;

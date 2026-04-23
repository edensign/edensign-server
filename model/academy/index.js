/**
 * Copyright © 2023, Eden Sign Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of Eden Sign Inc., and is licensed as
 * restricted rights software. The use, reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with Eden Sign.
 */

const Sequelize = require("sequelize");
const sequelize = require("../../sequelize");

const AcademyModel = sequelize.define(
    "academy",   //table name
    {
        title: {
            type: Sequelize.STRING,
            allowNull: false
        },
        description: {
            type: Sequelize.TEXT
        },
        youtube_link: {
            type: Sequelize.STRING,
            allowNull: false
        },
        category: {
            type: Sequelize.STRING
        },
        duration: {
            type: Sequelize.STRING
        },
        thumbnail_url: {
            type: Sequelize.STRING
        },
        status: {
            type: Sequelize.ENUM,
            values: ['active', 'inactive'],
            defaultValue: 'active'
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

module.exports = AcademyModel;

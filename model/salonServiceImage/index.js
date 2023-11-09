/**
 * Copyright © 2023, Eden Sign Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of Eden Sign Inc., and is licensed as
 * restricted rights software. The use, reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with Eden Sign.
 */

const Sequelize = require("sequelize");

const sequelize = require("../../sequelize");

const SalonServiceImageModel = sequelize.define(
    "salon_service_image",   //table name
    {
        salon_id: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        service_id: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        image: {
            type: Sequelize.STRING
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

module.exports = SalonServiceImageModel;

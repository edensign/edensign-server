/**
 * Copyright © 2023, Eden Sign Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of Eden Sign Inc., and is licensed as
 * restricted rights software. The use, reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with Eden Sign.
 */

const Sequelize = require("sequelize");

const sequelize = require("../../sequelize");

const AppointmentModel = sequelize.define(
    "appointment",   //table name
    {
        date: {
            type: 'DATETIME'
        },
        time_slot: {
            type: Sequelize.STRING
        },
        services: {
            type: Sequelize.STRING
        },
        salon_employee: {
            type: Sequelize.INTEGER
        },
        booked_for: {
            type: Sequelize.ENUM,
            values: ['self', 'kid', 'boy', 'girl', 'man', 'woman', 'senior_citizen']
        },
        customer_id: {
            type: Sequelize.INTEGER
        }
    },
    {
        timestamps: false,
        freezeTableName: true,
    }
);

module.exports = AppointmentModel;

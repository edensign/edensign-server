/**
 * Copyright © 2023, Eden Sign Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of Eden Sign Inc., and is licensed as
 * restricted rights software. The use, reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with Eden Sign.
 */

const Sequelize = require("sequelize");

const sequelize = require("../../sequelize");

const JobSeekerModel = sequelize.define(
    "job_seeker",   //table name
    {
        name: {
            type: Sequelize.STRING
        },
        email: {
            type: Sequelize.STRING
        },
        contact_no: {
            type: Sequelize.STRING
        },
        age: {
            type: Sequelize.INTEGER
        },
        gender: {
            type: Sequelize.ENUM,
            values: ['male', 'female', 'other']
        },
        qualification: {
            type: Sequelize.ENUM,
            values: ['10th', '12th', 'graduate']
        },
        status: {
            type: Sequelize.ENUM,
            values: ['active', 'inactive']
        },
        paid: {
            type: Sequelize.ENUM,
            values: ['yes', 'no']
        },
        hired_in: {
            type: Sequelize.STRING
        },
        designation: {
            type: Sequelize.STRING
        },
        description: {
            type: Sequelize.STRING
        },
        previous_employer: {
            type: Sequelize.STRING
        },
        skills: {
            type: Sequelize.STRING
        },
        hobbies: {
            type: Sequelize.STRING
        },
        experience: {
            type: Sequelize.STRING
        },
        resume: {
            type: Sequelize.STRING
        },
        job_location_preference: {
            type: Sequelize.ENUM,
            values: ['his_city', 'specific_city', 'specific_state', 'anywhere']
        },
        pref_city_id: {
            type: Sequelize.INTEGER
        },
        pref_state_id: {
            type: Sequelize.INTEGER
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

module.exports = JobSeekerModel;

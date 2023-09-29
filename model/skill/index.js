/**
 * Copyright © 2023, Eden Sign Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of Eden Sign Inc., and is licensed as
 * restricted rights software. The use,reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with Eden Sign.
 */

const Sequelize = require("sequelize");

const sequelize = require("../../sequelize");
// const JobSeekerModel = require("../jobSeeker");
// const SalonEmployeeModel = require("../salonEmployee");   these were used for foreign key associations


const SkillModel = sequelize.define(
    "skill",     //table name
    {
        name: {
            type: Sequelize.STRING
        },
        status: {
            type: Sequelize.ENUM,
            values: ['active', 'inactive']
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

//Define the foreign key associations
// SkillModel.belongsTo(JobSeekerModel, { foreignKey: "id" });
// SkillModel.belongsTo(SalonEmployeeModel, { foreignKey: "id" });


module.exports = SkillModel;

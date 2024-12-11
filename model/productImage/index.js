/**
 * Copyright © 2023, Eden Sign Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of Eden Sign Inc., and is licensed as
 * restricted rights software. The use,reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with Eden Sign.
 */

const Sequelize = require("sequelize");

const sequelize = require("../../sequelize");

const ProductImageModel = sequelize.define(
    "product_image",     //table name
    {
        parent_id: {
            type: Sequelize.INTEGER
        },
        priority: {
            type: Sequelize.INTEGER
        },
        type: {
            type: Sequelize.ENUM,
            values: ['normal', 'sideways']
        },
        image_src: {
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

module.exports = ProductImageModel;

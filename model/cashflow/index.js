/**
 * Copyright © 2023, Eden Sign Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of Eden Sign Inc., and is licensed as
 * restricted rights software. The use,reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with Eden Sign.
 */

const Sequelize = require("sequelize");
const sequelize = require("../../sequelize");
const SalonModel = require("../salon");

const CashflowModel = sequelize.define(
    'cashflow',
    {
        salon_id: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: SalonModel,
                key: 'id'
            }
        },
        amount: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0.00
        },
        type: {
            type: Sequelize.ENUM,
            values: ['credit', 'debit'],
            allowNull: false
        },
        category: {
            type: Sequelize.STRING
        },
        payment_method: {
            type: Sequelize.STRING
        },
        description: {
            type: Sequelize.TEXT
        },
        transaction_date: {
            type: 'DATETIME',
            defaultValue: Sequelize.NOW
        },
        created_by: {
            type: Sequelize.INTEGER
        },
        updated_by: {
            type: Sequelize.INTEGER
        },
        created_at: {
            type: 'TIMESTAMP'
        },
        updated_at: {
            type: 'TIMESTAMP'
        }
    },
    {
        timestamps: false,
        freezeTableName: true
    }
);

// Define association
CashflowModel.belongsTo(SalonModel, { foreignKey: 'salon_id', targetKey: 'id' });

module.exports = CashflowModel;

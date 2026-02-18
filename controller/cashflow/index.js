/**
 * Copyright © 2023, Eden Sign Inc. ALL RIGHTS RESERVED.
 *
 * This software is the confidential information of Eden Sign Inc., and is licensed as
 * restricted rights software. The use,reproduction, or disclosure of this software is subject to
 * restrictions set forth in your license agreement with Eden Sign.
 */

const { Op, Sequelize } = require("sequelize");
const Utility = require("../../utility");
const CashflowModel = require("../../model/cashflow");
const SalonModel = require("../../model/salon");

const cashflowController = {
    /** Get all cashflow transactions with pagination and filters
     */
    getAll: (req, res) => {
        const { page, size, search, type, startDate, endDate, salonId } = req.query;
        const { limit, offset } = Utility.getPagination(parseInt(page), parseInt(size));

        let searchCond = {};

        // Filter by Search (Description or Category)
        if (search) {
            searchCond = {
                [Op.or]: [
                    { description: { [Op.like]: `%${search}%` } },
                    { category: { [Op.like]: `%${search}%` } }
                ]
            };
        }

        // Filter by Type (credit/debit)
        if (type) {
            searchCond.type = type;
        }

        // Filter by Date Range
        if (startDate && endDate) {
            searchCond.transaction_date = {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            };
        }

        // Filter by Salon ID
        if (salonId) {
            searchCond.salon_id = salonId;
        }

        CashflowModel.findAndCountAll({
            limit, offset,
            where: { ...searchCond },
            include: [
                {
                    model: SalonModel,
                    attributes: ['id', 'name']
                }
            ],
            order: [
                ["transaction_date", "DESC"]
            ]
        })
            .then(list => {
                const { count, rows } = list;
                if (count > 0) {
                    res.status(200).send(Utility.formatResponse(200, { count, rows }));
                } else {
                    res.status(404).send(Utility.formatResponse(404, `No Data Found`));
                }
            })
            .catch(err => {
                res.status(500).send(Utility.formatResponse(500, err));
            });
    },

    /** Get cashflow transaction by ID
     */
    getById: (req, res) => {
        const id = req.params.id;
        CashflowModel.findByPk(id)
            .then(data => {
                if (data) {
                    res.status(200).send(Utility.formatResponse(200, data));
                } else {
                    res.status(404).send(Utility.formatResponse(404, `Transaction with id=${id} not found`));
                }
            })
            .catch(err => {
                res.status(500).send(Utility.formatResponse(500, err));
            });
    },

    /** Create a new cashflow transaction
     */
    create: (req, res) => {
        const { salon_id, amount, type, category, payment_method, description, transaction_date } = req.body;
        const createData = {
            salon_id,
            amount,
            type,
            category,
            payment_method,
            description,
            transaction_date: transaction_date || new Date(),
            created_by: req.body.userId
        };

        CashflowModel.create(createData)
            .then(data => {
                res.status(200).send(Utility.formatResponse(200, `Transaction Created Successfully`));
            })
            .catch(err => {
                res.status(500).send(Utility.formatResponse(500, err));
            });
    },

    /** Update an existing cashflow transaction
     */
    update: (req, res) => {
        const { id, amount, type, category, payment_method, description, transaction_date } = req.body;
        const updateData = { updated_by: req.body.userId };

        if (amount !== undefined) updateData.amount = amount;
        if (type !== undefined) updateData.type = type;
        if (category !== undefined) updateData.category = category;
        if (payment_method !== undefined) updateData.payment_method = payment_method;
        if (description !== undefined) updateData.description = description;
        if (transaction_date !== undefined) updateData.transaction_date = transaction_date;

        CashflowModel.update(updateData, { where: { id } })
            .then(num => {
                if (num == 1) {
                    res.status(200).send(Utility.formatResponse(200, `Transaction Updated Successfully`));
                } else {
                    res.status(404).send(Utility.formatResponse(404, `Cannot update Transaction with id=${id}. Maybe Transaction was not found or req.body is empty!`));
                }
            })
            .catch(err => {
                res.status(500).send(Utility.formatResponse(500, err));
            });
    },

    /** Delete a cashflow transaction
     */
    delete: (req, res) => {
        const id = req.query.id;

        CashflowModel.destroy({
            where: { id: id }
        })
            .then(num => {
                if (num == 1) {
                    res.status(200).send(Utility.formatResponse(200, "Transaction was deleted successfully!"));
                } else {
                    res.status(404).send(Utility.formatResponse(404, `Cannot delete Transaction with id=${id}. Maybe Transaction was not found!`));
                }
            })
            .catch(err => {
                res.status(500).send(Utility.formatResponse(500, "Could not delete Transaction with id=" + id));
            });
    },

    /** Get cashflow summary (Total Income, Total Expense, Balance)
     */
    getSummary: (req, res) => {
        const { startDate, endDate, salonId } = req.query;
        let searchCond = {};

        if (startDate && endDate) {
            searchCond.transaction_date = {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            };
        }

        if (salonId) {
            searchCond.salon_id = salonId;
        }

        // Aggregate query to get total credit and total debit
        CashflowModel.findAll({
            attributes: [
                'type',
                [Sequelize.fn('SUM', Sequelize.col('amount')), 'totalAmount']
            ],
            where: searchCond,
            group: ['type']
        })
            .then(result => {
                let summary = {
                    income: 0,
                    expense: 0,
                    balance: 0
                };

                result.forEach(item => {
                    if (item.type === 'credit') {
                        summary.income = parseFloat(item.dataValues.totalAmount || 0);
                    } else if (item.type === 'debit') {
                        summary.expense = parseFloat(item.dataValues.totalAmount || 0);
                    }
                });

                summary.balance = summary.income - summary.expense;
                res.status(200).send(Utility.formatResponse(200, summary));
            })
            .catch(err => {
                res.status(500).send(Utility.formatResponse(500, err));
            });
    }
};

module.exports = cashflowController;

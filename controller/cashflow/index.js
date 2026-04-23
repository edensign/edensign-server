/**
 * Copyright © 2023, Eden Sign Inc. ALL RIGHTS RESERVED.
 */

const supabase = require("../../supabase");
const Utility = require("../../utility");

const cashflowController = {
    /** Get all cashflow transactions with pagination and filters */
    getAll: async (req, res) => {
        try {
            const { page, size, search, type, startDate, endDate, salonId } = req.query;
            const { limit, offset } = Utility.getPagination(parseInt(page), parseInt(size));

            let query = supabase
                .from('cashflow')
                .select('*, salon:salon_id(id, name)', { count: 'exact' });

            if (search) {
                query = query.or(`description.ilike.%${search}%,category.ilike.%${search}%`);
            }

            if (type) {
                query = query.eq('type', type);
            }

            if (startDate && endDate) {
                query = query.gte('transaction_date', new Date(startDate).toISOString())
                             .lte('transaction_date', new Date(endDate).toISOString());
            }

            if (salonId) {
                query = query.eq('salon_id', salonId);
            }

            const { data, count, error } = await query
                .order('transaction_date', { ascending: false })
                .range(offset, offset + limit - 1);

            if (error) throw error;

            if (count > 0) {
                res.status(200).send(Utility.formatResponse(200, { count, rows: data }));
            } else {
                res.status(404).send(Utility.formatResponse(404, `No Data Found`));
            }
        } catch (err) {
            console.error("Cashflow getAll error:", err);
            res.status(500).send(Utility.formatResponse(500, err.message));
        }
    },

    /** Get cashflow transaction by ID */
    getById: async (req, res) => {
        try {
            const { data, error } = await supabase
                .from('cashflow')
                .select('*')
                .eq('id', req.params.id)
                .single();

            if (error && error.code !== 'PGRST116') throw error;

            if (data) {
                res.status(200).send(Utility.formatResponse(200, data));
            } else {
                res.status(404).send(Utility.formatResponse(404, `Transaction not found`));
            }
        } catch (err) {
            console.error("Cashflow getById error:", err);
            res.status(500).send(Utility.formatResponse(500, err.message));
        }
    },

    /** Create a new cashflow transaction */
    create: async (req, res) => {
        try {
            const payload = { 
                ...req.body, 
                transaction_date: req.body.transaction_date || new Date().toISOString(),
                created_by: req.body.userId 
            };
            delete payload.userId;

            const { error } = await supabase
                .from('cashflow')
                .insert(payload);

            if (error) throw error;

            res.status(200).send(Utility.formatResponse(200, `Transaction Created Successfully`));
        } catch (err) {
            console.error("Cashflow create error:", err);
            res.status(500).send(Utility.formatResponse(500, err.message));
        }
    },

    /** Update an existing cashflow transaction */
    update: async (req, res) => {
        try {
            const payload = { ...req.body, updated_by: req.body.userId, updated_at: new Date().toISOString() };
            const id = payload.id;
            delete payload.userId;
            delete payload.id;

            const { error } = await supabase
                .from('cashflow')
                .update(payload)
                .eq('id', id);

            if (error) throw error;

            res.status(200).send(Utility.formatResponse(200, `Transaction Updated Successfully`));
        } catch (err) {
            console.error("Cashflow update error:", err);
            res.status(500).send(Utility.formatResponse(500, err.message));
        }
    },

    /** Delete a cashflow transaction */
    delete: async (req, res) => {
        try {
            const { error } = await supabase
                .from('cashflow')
                .delete()
                .eq('id', req.query.id);

            if (error) throw error;

            res.status(200).send(Utility.formatResponse(200, "Transaction was deleted successfully!"));
        } catch (err) {
            console.error("Cashflow delete error:", err);
            res.status(500).send(Utility.formatResponse(500, "Could not delete Transaction"));
        }
    },

    /** Get cashflow summary (Total Income, Total Expense, Balance) */
    getSummary: async (req, res) => {
        try {
            const { startDate, endDate, salonId } = req.query;

            let query = supabase.from('cashflow').select('type, amount');

            if (startDate && endDate) {
                query = query.gte('transaction_date', new Date(startDate).toISOString())
                             .lte('transaction_date', new Date(endDate).toISOString());
            }

            if (salonId) {
                query = query.eq('salon_id', salonId);
            }

            const { data, error } = await query;
            if (error) throw error;

            let summary = { income: 0, expense: 0, balance: 0 };

            data.forEach(item => {
                if (item.type === 'credit') {
                    summary.income += parseFloat(item.amount || 0);
                } else if (item.type === 'debit') {
                    summary.expense += parseFloat(item.amount || 0);
                }
            });

            summary.balance = summary.income - summary.expense;
            res.status(200).send(Utility.formatResponse(200, summary));

        } catch (err) {
            console.error("Cashflow getSummary error:", err);
            res.status(500).send(Utility.formatResponse(500, err.message));
        }
    }
};

module.exports = cashflowController;

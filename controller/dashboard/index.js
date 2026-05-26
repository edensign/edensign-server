/**
 * Copyright © 2023, Eden Sign Inc. ALL RIGHTS RESERVED.
 */

const supabase = require("../../supabase");
const Utility = require("../../utility");

const dashboardController = {
    /** Get dashboard stats for Admin */
    getAdminStats: async (req, res) => {
        try {
            // Run aggregate queries concurrently for better performance
            const [
                salonResult,
                userResult,
                productResult,
                cashflowResult,
                salonsForGraph
            ] = await Promise.all([
                supabase.from('salon').select('*', { count: 'exact', head: true }),
                supabase.from('users').select('*', { count: 'exact', head: true }),
                supabase.from('product').select('*', { count: 'exact', head: true }),
                supabase.from('cashflow').select('amount').eq('type', 'credit'),
                // For graph: fetch all salons created in current year to aggregate by month
                supabase.from('salon').select('created_at').gte('created_at', new Date(new Date().getFullYear(), 0, 1).toISOString())
            ]);

            if (salonResult.error) throw salonResult.error;
            if (userResult.error) throw userResult.error;
            if (productResult.error) throw productResult.error;
            if (cashflowResult.error) throw cashflowResult.error;
            if (salonsForGraph.error) throw salonsForGraph.error;

            // Calculate total sales
            let totalSales = 0;
            if (cashflowResult.data) {
                totalSales = cashflowResult.data.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
            }

            // Calculate graph data (salons created per month)
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const graphData = months.map(month => ({
                month: month,
                salons: 0
            }));

            if (salonsForGraph.data) {
                salonsForGraph.data.forEach(salon => {
                    const date = new Date(salon.created_at);
                    const monthIndex = date.getMonth(); // 0-11
                    graphData[monthIndex].salons += 1;
                });
            }

            res.status(200).send(Utility.formatResponse(200, {
                totalSalons: salonResult.count || 0,
                totalClients: userResult.count || 0,
                totalProducts: productResult.count || 0,
                totalSales: totalSales,
                graphData: graphData
            }));
            
        } catch (err) {
            console.error("getAdminStats error:", err);
            res.status(500).send(Utility.formatResponse(500, err.message));
        }
    }
};

module.exports = dashboardController;

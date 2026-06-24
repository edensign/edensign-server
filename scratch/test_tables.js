const supabase = require('../supabase.js');
const Utility = require('../utility');

async function testTables() {
    console.log("Checking category table...");
    const categoryRes = await supabase.from('category').select('*');
    console.log("Category Result:", { data: categoryRes.data, error: categoryRes.error });

    console.log("Checking company table...");
    const companyRes = await supabase.from('company').select('*');
    console.log("Company Result:", { data: companyRes.data, error: companyRes.error });

    console.log("Checking distributor table...");
    const distributorRes = await supabase.from('distributor').select('*');
    console.log("Distributor Result:", { data: distributorRes.data, error: distributorRes.error });

    console.log("Checking users table for admin...");
    const { data: adminData, error: adminError } = await supabase
        .from('users')
        .select('*')
        .eq('type', 'admin');
    console.log("Admin Users:", { adminData, adminError });
}

testTables();

const supabase = require('../supabase.js');
async function checkSchema() {
    const { data, error } = await supabase.rpc('get_table_info', { table_name: 'user_offer_cards' });
    if (error) {
        // Fallback: try to select 1 row
        const res = await supabase.from('user_offer_cards').select('*').limit(1);
        console.log("fallback row data:", res.data, "error:", res.error);
    } else {
        console.log("schema:", data);
    }
}
checkSchema();

const supabase = require('../supabase.js');

async function testInsert() {
    const payload = {
        user_id: 240, // random
        offer_id: 1, // random
        customer_name: "Test",
        customer_address: "Test Addr",
        customer_phone: "123456",
        card_id: "OC-1234",
        valid_till: new Date().toISOString(),
        status: 'active',
        created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
        .from('user_offer_cards')
        .insert(payload)
        .select()
        .single();

    if (error) {
        console.log("SUPABASE ERROR:", error);
    } else {
        console.log("SUPABASE SUCCESS:", data);
        
        // Clean up
        await supabase.from('user_offer_cards').delete().eq('id', data.id);
    }
}

testInsert();

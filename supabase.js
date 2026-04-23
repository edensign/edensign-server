/**
 * Copyright © 2023, Eden Sign Inc. ALL RIGHTS RESERVED.
 *
 * Supabase client — replaces sequelize.js
 * Uses the SERVICE ROLE KEY so all server queries bypass RLS.
 */

const { createClient } = require('@supabase/supabase-js');
const config = require('./config');

const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_SERVICE_KEY, {
    auth: {
        persistSession: false,      // Server-side: no session needed
        autoRefreshToken: false
    }
});

module.exports = supabase;

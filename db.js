/**
 * Copyright © 2023, Eden Sign Inc. ALL RIGHTS RESERVED.
 *
 * Supabase connectivity — replaces MySQL connectToMysql()
 * The Supabase client is initialized lazily; this just validates the config.
 */

const config = require('./config');

const connectToSupabase = () => {
    if (!config.SUPABASE_URL || !config.SUPABASE_SERVICE_KEY) {
        throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in environment');
    }
    console.log('Supabase client configured →', config.SUPABASE_URL);
    return Promise.resolve('Supabase client ready');
};

module.exports = connectToSupabase();

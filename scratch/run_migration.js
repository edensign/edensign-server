const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../local.env') });

const dbPassword = process.env.SUPABASE_DB_PASSWORD;
if (!dbPassword) {
    console.error("ERROR: SUPABASE_DB_PASSWORD environment variable is missing in local.env!");
    console.error("Please add SUPABASE_DB_PASSWORD=your_db_password to local.env and run again.");
    process.exit(1);
}

// Supabase host is extracted from the SUPABASE_URL
// https://oaqyonnkveufkkamswzv.supabase.co -> oaqyonnkveufkkamswzv
const supabaseUrl = process.env.SUPABASE_URL || '';
const refId = supabaseUrl.split('//')[1]?.split('.')[0];

if (!refId) {
    console.error("ERROR: Could not parse Supabase project ref ID from SUPABASE_URL!");
    process.exit(1);
}

const connectionString = `postgresql://postgres:${dbPassword}@db.${refId}.supabase.co:5432/postgres`;

console.log(`Connecting to Supabase DB: db.${refId}.supabase.co...`);

const client = new Client({
    connectionString: connectionString,
});

async function runMigration() {
    try {
        await client.connect();
        console.log("Connected successfully to PostgreSQL database.");

        const sqlFilePath = path.resolve(__dirname, '../../supabase_migrations/company_distributor_setup.sql');
        console.log(`Reading SQL file: ${sqlFilePath}...`);
        const sql = fs.readFileSync(sqlFilePath, 'utf8');

        console.log("Executing SQL migration commands...");
        await client.query(sql);
        console.log("SUCCESS: Migration executed successfully!");
    } catch (err) {
        console.error("Migration execution failed:", err);
    } finally {
        await client.end();
    }
}

runMigration();

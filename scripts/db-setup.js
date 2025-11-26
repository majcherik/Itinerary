import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectUrl = process.env.VITE_SUPABASE_URL;
const projectRef = projectUrl ? projectUrl.match(/https:\/\/(.+?)\.supabase\.co/)[1] : null;
const dbPassword = process.env.DB_PASSWORD;

if (!projectRef || !dbPassword) {
    console.error('Error: Missing VITE_SUPABASE_URL or DB_PASSWORD.');
    process.exit(1);
}

// Connection string for Supabase (Pooler connection)
const connectionString = `postgres://postgres.zomrmjwevkbofgvjfexy:${encodeURIComponent(dbPassword)}@aws-1-eu-west-1.pooler.supabase.com:6543/postgres`;

const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false } // Required for Supabase
});

async function migrate() {
    try {
        await client.connect();
        console.log('Connected to Supabase Postgres...');

        const sqlPath = path.join(__dirname, '../supabase_schema.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Running migration...');
        await client.query(sql);

        console.log('Migration successful! Tables created.');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await client.end();
    }
}

migrate();

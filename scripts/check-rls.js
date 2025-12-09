const { Client } = require('pg');

const connectionString = 'postgresql://postgres.zomrmjwevkbofgvjfexy:g3ML5%2FUfu_HxBQS@aws-1-eu-west-1.pooler.supabase.com:6543/postgres';

const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
});

async function checkRLS() {
    try {
        await client.connect();
        console.log('Connected to database...');

        const res = await client.query(`
      SELECT 
        tablename, 
        rowsecurity 
      FROM pg_tables 
      WHERE schemaname = 'public';
    `);

        console.log('\\n--- RLS STATUS ---');
        res.rows.forEach(row => {
            console.log(`${row.tablename}: ${row.rowsecurity ? 'ENABLED' : 'DISABLED'}`);
        });

        const policies = await client.query(`
      SELECT 
        tablename, 
        policyname, 
        permissive, 
        roles, 
        cmd, 
        qual, 
        with_check 
      FROM pg_policies 
      WHERE schemaname = 'public';
    `);

        console.log('\\n--- RLS POLICIES ---');
        if (policies.rows.length === 0) {
            console.log('No policies found.');
        } else {
            policies.rows.forEach(p => {
                console.log(`Table: ${p.tablename} | Policy: ${p.policyname} | Cmd: ${p.cmd}`);
            });
        }

    } catch (err) {
        console.error('Error checking RLS:', err);
    } finally {
        await client.end();
    }
}

checkRLS();

import { Client } from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

async function applyTrigger() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();
        console.log('Connected to database.');

        const sqlPath = path.join(process.cwd(), 'supabase', 'create_trigger.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        await client.query(sql);
        console.log('Trigger applied successfully.');

    } catch (err) {
        console.error('Error applying trigger:', err);
    } finally {
        await client.end();
    }
}

applyTrigger();

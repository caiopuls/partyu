import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

// Tentar pegar a URL do banco do env ou usar o padrão do Supabase local
const dbUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:54322/postgres';

const client = new Client({
    connectionString: dbUrl,
});

async function run() {
    try {
        console.log('Connecting to database...');
        await client.connect();

        console.log('Applying schema updates...');

        // Adicionar colunas status, cpf_cnpj, pix_key, pix_key_type
        await client.query(`
      ALTER TABLE profiles 
      ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
      ADD COLUMN IF NOT EXISTS cpf_cnpj TEXT,
      ADD COLUMN IF NOT EXISTS pix_key TEXT,
      ADD COLUMN IF NOT EXISTS pix_key_type TEXT;
    `);

        // Atualizar constraint de role
        await client.query(`
      ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
      ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('user', 'admin', 'organizer'));
    `);

        console.log('Schema updated successfully!');
    } catch (err) {
        console.error('Error updating schema:', err);
    } finally {
        await client.end();
    }
}

run();

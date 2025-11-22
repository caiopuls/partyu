import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

async function fixWalletRLS() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('Connected to database.');

        const sql = `
      -- Enable RLS on wallets if not already
      ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;

      -- Policy for users to read their own wallet
      DROP POLICY IF EXISTS "Users can read own wallet" ON wallets;
      CREATE POLICY "Users can read own wallet" ON wallets
        FOR SELECT USING (auth.uid() = user_id);

      -- Policy for users to update their own wallet (if needed, though usually system does it)
      -- But for now let's just allow read.
      
      -- Policy for admins to read all wallets
      DROP POLICY IF EXISTS "Admins can read all wallets" ON wallets;
      CREATE POLICY "Admins can read all wallets" ON wallets
        FOR SELECT USING (
          EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
          )
        );
    `;

        await client.query(sql);
        console.log('Wallet policies applied successfully.');

    } catch (err) {
        console.error('Error applying wallet policies:', err);
    } finally {
        await client.end();
    }
}

fixWalletRLS();

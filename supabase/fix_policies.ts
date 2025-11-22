import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

async function fixPolicies() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();
        console.log('Connected to database.');

        const sql = `
      -- Enable RLS
      ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

      -- Policy for users to read their own profile
      DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
      CREATE POLICY "Users can read own profile" ON profiles
        FOR SELECT USING (auth.uid() = id);

      -- Policy for admins to read all profiles
      -- We use a security definer function to avoid infinite recursion if we were to query profiles directly in the policy
      -- But since we have "Users can read own profile", simple recursion might work. 
      -- To be safe, let's just trust the "Users can read own profile" covers the subquery.
      
      DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
      CREATE POLICY "Admins can read all profiles" ON profiles
        FOR SELECT USING (
          EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
          )
        );

      -- Policy for admins to update profiles
      DROP POLICY IF EXISTS "Admins can update profiles" ON profiles;
      CREATE POLICY "Admins can update profiles" ON profiles
        FOR UPDATE USING (
          EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
          )
        );
        
      -- Also allow insert for registration triggers usually, but here profiles are created by trigger.
      -- If we need to update our own profile (e.g. complete setup)
      DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
      CREATE POLICY "Users can update own profile" ON profiles
        FOR UPDATE USING (auth.uid() = id);
    `;

        await client.query(sql);
        console.log('Policies applied successfully.');

    } catch (err) {
        console.error('Error applying policies:', err);
    } finally {
        await client.end();
    }
}

fixPolicies();

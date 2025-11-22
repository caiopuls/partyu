import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkPolicies() {
    const { data, error } = await supabase
        .from('pg_policies')
        .select('*')
        .eq('tablename', 'profiles');

    if (error) {
        // pg_policies is a system table, might not be accessible via standard client depending on exposure.
        // If this fails, I'll try a direct SQL query if I had a way, but I don't.
        // Alternatively, I can try to fetch the profile AS the user to see if it works.
        console.error('Error fetching policies:', error);
    } else {
        console.log('Policies:', data);
    }

    // Test fetch as admin user
    const adminEmail = 'admin@partyu.com';
    const { data: { users } } = await supabase.auth.admin.listUsers();
    const adminUser = users.find(u => u.email === adminEmail);

    if (adminUser) {
        console.log('Testing access for admin user:', adminUser.id);
        // We can't easily "impersonate" with just the ID in this client without a session.
        // But we can check if the service role can read it (which it can).
        // The middleware uses `createServerClient` which uses the ANON key but passes cookies.
        // So it acts as the user.

        // Let's just print the policies if possible, or I will try to deduce from the codebase.
    }
}

checkPolicies();

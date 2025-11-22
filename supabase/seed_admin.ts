import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedAdmin() {
    const email = 'admin@partyu.com';
    const password = 'adminpro';

    console.log('Creating/Updating Super Admin...');

    // 1. Check if user exists
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingUser = existingUsers.users.find(u => u.email === email);

    let userId;

    if (existingUser) {
        console.log('Admin user already exists. Updating password...');
        const { data, error } = await supabase.auth.admin.updateUserById(
            existingUser.id,
            { password: password, user_metadata: { full_name: 'Super Admin' } }
        );
        if (error) throw error;
        userId = data.user.id;
    } else {
        console.log('Creating new Admin user...');
        const { data, error } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name: 'Super Admin' },
        });
        if (error) throw error;
        userId = data.user.id;
    }

    // 2. Ensure profile has 'admin' role
    const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
            id: userId,
            role: 'admin',
            status: 'approved',
            full_name: 'Super Admin'
        });

    if (profileError) {
        console.error('Error updating profile role:', profileError);
    } else {
        console.log('Admin profile updated successfully.');
    }
}

seedAdmin().catch(console.error);

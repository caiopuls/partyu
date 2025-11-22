import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkRoles() {
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();

    if (userError) {
        console.error('Error fetching users:', userError);
        return;
    }

    const targetUsers = users.filter(u => ['admin@partyu.com', 'organizer2@test.com'].includes(u.email || ''));
    const userIds = targetUsers.map(u => u.id);

    console.log('Found users:', targetUsers.map(u => ({ email: u.email, id: u.id })));

    const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);

    if (profileError) {
        console.error('Error fetching profiles:', profileError);
        return;
    }

    console.log('Profiles:', profiles);
}

checkRoles();

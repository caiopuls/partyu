import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkWallets() {
    const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error fetching wallets:', error);
    } else {
        console.log('Wallets table exists.');
    }
}

checkWallets();

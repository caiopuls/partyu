import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function markOrderPaid() {
    // Get the last order
    const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

    if (error || !orders || orders.length === 0) {
        console.error('Error fetching order:', error);
        return;
    }

    const order = orders[0];
    console.log('Found order:', JSON.stringify(order, null, 2));

    if (order.status === 'paid') {
        console.log('Order already paid. Proceeding to credit wallet anyway.');
        // return; // Commented out to force credit
    }

    // Update order status
    const { error: updateError } = await supabase
        .from('orders')
        .update({ status: 'paid' })
        .eq('id', order.id);

    if (updateError) {
        console.error('Error updating order:', updateError);
        return;
    }

    console.log('Order marked as paid.');

    // Credit wallet manually since trigger failed
    const eventId = order.event_id || order.metadata?.event_id;

    const { data: event, error: eventError } = await supabase
        .from('events')
        .select('organizer_id, title')
        .eq('id', eventId)
        .single();

    if (eventError || !event) {
        console.error('Error fetching event:', eventError);
        return;
    }

    console.log('Crediting wallet for organizer:', event.organizer_id);


    // Better to use auth.admin.getUserById if available in this client (it is)
    // But supabase-js client here is created with service key, so it has admin access.
    // However, auth.users is not a table we can select from with .from() usually unless exposed.
    // Let's use auth.admin.getUserById

    const { data: { user: organizerUser }, error: userError } = await supabase.auth.admin.getUserById(event.organizer_id);
    console.log('Organizer Email:', organizerUser?.email);

    // Check if wallet exists
    const { data: wallet, error: walletError } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', event.organizer_id)
        .single();

    if (wallet) {
        const { error: updateWalletError } = await supabase
            .from('wallets')
            .update({ balance: wallet.balance + order.total_amount, updated_at: new Date().toISOString() })
            .eq('user_id', event.organizer_id);

        if (updateWalletError) console.error('Error updating wallet:', updateWalletError);
        else console.log('Wallet updated.');
    } else {
        const { error: insertWalletError } = await supabase
            .from('wallets')
            .insert({
                user_id: event.organizer_id,
                balance: order.total_amount,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });

        if (insertWalletError) console.error('Error creating wallet:', insertWalletError);
        else console.log('Wallet created and credited.');
    }
}

markOrderPaid();

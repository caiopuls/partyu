import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    console.log('Balance API called (simplified)');

    const authClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            global: {
                headers: {
                    cookie: request.headers.get('cookie') || '',
                    Authorization: request.headers.get('Authorization') || '',
                },
            },
        }
    );

    console.log('Auth client created');
    const { data: { user }, error: authError } = await authClient.auth.getUser();
    console.log('User fetched:', user?.id, authError);

    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminClient = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: wallet, error } = await adminClient
        .from('wallets')
        .select('balance')
        .eq('user_id', user.id)
        .single();

    console.log('Wallet fetched:', wallet, error);

    if (error) {
        if (error.code === 'PGRST116') {
            return NextResponse.json({ balance: 0 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ balance: wallet.balance });
}

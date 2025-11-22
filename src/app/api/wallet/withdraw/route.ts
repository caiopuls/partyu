import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
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

  const { data: { user }, error: authError } = await authClient.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { amount, pix_key, pix_key_type } = body;

  if (!amount || !pix_key || !pix_key_type) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Check balance first
  const { data: wallet } = await adminClient
    .from('wallets')
    .select('balance')
    .eq('user_id', user.id)
    .single();

  if (!wallet || wallet.balance < amount) {
    return NextResponse.json({ error: 'Insufficient funds' }, { status: 400 });
  }

  // Create withdrawal request
  const { error: insertError } = await adminClient
    .from('withdrawals')
    .insert({
      user_id: user.id,
      amount,
      pix_key,
      pix_key_type,
      status: 'pending'
    });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  // Deduct from wallet
  const { error: updateError } = await adminClient
    .from('wallets')
    .update({ balance: wallet.balance - amount })
    .eq('user_id', user.id);

  if (updateError) {
    console.error('Error deducting balance:', updateError);
    return NextResponse.json({ error: 'Error processing withdrawal' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

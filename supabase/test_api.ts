import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testApi() {
    // Login
    const { data: { session }, error } = await supabase.auth.signInWithPassword({
        email: 'organizer2@test.com',
        password: 'password123'
    });

    if (error || !session) {
        console.error('Login failed:', error);
        return;
    }

    console.log('Logged in. Token:', session.access_token.substring(0, 20) + '...');

    // Fetch API
    // We need to construct the cookie string.
    // Supabase usually sets `sb-<ref>-auth-token` or similar.
    // But wait, the API route uses `createClient` which expects standard Supabase cookies if using `createServerClient`.
    // But I switched to `createClient` with `global.headers.cookie`.
    // The cookie name depends on how `supabase-js` or the auth helper sets it.
    // Usually it's `sb-access-token` and `sb-refresh-token` or a combined one.
    // But since I am using `supabase-js` on client side (in browser), it stores in local storage.
    // The `createServerClient` (and middleware) expects cookies.

    // Wait, if the browser uses `createBrowserClient`, it sets cookies.
    // The cookie name is usually `sb-[project-ref]-auth-token`.
    // I can try to simulate the cookie.

    // Actually, if I use `fetch` with `Authorization: Bearer token`, does `supabase-js` pick it up?
    // `createClient` in the API route reads from `cookie` header.
    // It does NOT read from Authorization header by default unless configured?
    // Standard `createClient` reads from where you tell it.
    // I told it to read from `cookie` header.

    // So I need to send the cookie.
    // The cookie format is a JSON string usually.
    // Let's try to just send the access token as a cookie if I knew the name.
    // The name is `sb-${process.env.NEXT_PUBLIC_SUPABASE_REFERENCE_ID}-auth-token`.
    // But I don't have reference ID in env maybe?
    // It's part of the URL usually.

    // Let's try to just use the `Authorization` header and update the API route to ALSO check that?
    // That would be robust.

    // But let's first try to see what the API returns if I send the token in a way it expects.

    // Actually, I can update the API route to accept Authorization header too.
    // This is good practice.

    const response = await fetch('http://localhost:3030/api/wallet/balance', {
        headers: {
            // Try to send as cookie if we can guess the name, or just send all cookies from session?
            // Supabase session doesn't give cookies directly.
            // Let's try to send Authorization header and modify API to use it.
            'Authorization': `Bearer ${session.access_token}`
        }
    });

    const text = await response.text();
    console.log('API Response:', response.status, text);
}

testApi();

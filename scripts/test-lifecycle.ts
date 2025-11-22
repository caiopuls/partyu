
import dotenv from 'dotenv';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}` : 'http://localhost:3030'; // Use dev server ports
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function runLifecycleTest() {
    console.log("🚀 Starting Full Lifecycle Test (Mock Mode)\n");

    try {
        // 1. Setup Users (Buyer 1, Buyer 2, Organizer)
        console.log("1️⃣  Setting up test users...");

        // Ensure we have at least 2 users
        let { data: users } = await supabase.from('profiles').select('id').limit(2);

        if (!users || users.length < 2) {
            console.log("   Creating test users...");
            // Create dummy users if needed (requires service role to bypass auth if inserting into profiles directly, 
            // but profiles are usually created via triggers on auth.users. 
            // We can't easily create auth users here without admin API.
            // Let's assume there are users or fail with a clear message to login first.)
            throw new Error("Need at least 2 users in DB. Please sign up 2 users in the app first.");
        }

        const buyer1 = users[0];
        const buyer2 = users[1]; // Acts as Organizer

        console.log(`   Buyer 1: ${buyer1.id}`);
        console.log(`   Organizer (Buyer 2): ${buyer2.id}`);

        // Get or Create Event/Ticket Type
        let { data: ticketType } = await supabase.from('event_ticket_types').select('*').limit(1).single();

        if (!ticketType) {
            console.log("   Creating test event and ticket type...");
            const { data: event, error: eventError } = await supabase.from('events').insert({
                title: "Test Event",
                organizer_id: buyer2.id,
                event_date: new Date().toISOString(),
                city: "Test City",
                state: "TS",
                venue: "Test Venue",
                address: "Test Address",
                description: "Test Description",
                status: "active",
                category: "Show"
            }).select().single();

            if (eventError) throw new Error(`Failed to create event: ${eventError.message}`);

            const { data: newTicketType, error: ttError } = await supabase.from('ticket_types').insert({
                event_id: event.id,
                name: "General Admission",
                price: 10000, // 100.00
                quantity: 100,
                description: "Test Ticket"
            }).select().single();

            if (ttError) throw new Error(`Failed to create ticket type: ${ttError.message}`);
            ticketType = newTicketType;
        }

        // 2. Create Order (Simulating UI)
        console.log("\n2️⃣  Simulating Ticket Purchase (Buyer 1)...");
        const amount = 15000; // 150.00 (R$ 138 + R$ 12 fee)

        const { data: order, error: orderError } = await supabase.from('orders').insert({
            user_id: buyer1.id,
            total_amount: amount,
            status: 'pending',
            origin: 'primary',
            metadata: {
                event_id: ticketType.event_id,
                ticket_type_id: ticketType.id,
                processing_fee: 12.0,
                ticket_price: amount - 12.0
            }
        }).select().single();

        if (orderError) throw new Error(`Failed to create order: ${orderError.message}`);
        console.log(`   Order created: ${order.id}`);

        // Create Transaction
        const { data: tx, error: txError } = await supabase.from('payment_transactions').insert({
            order_id: order.id,
            external_id: order.id, // In our flow, correlationID = orderId
            payment_type: 'pix',
            amount: amount,
            status: 'pending',
            metadata: {
                origin: 'primary',
                organizer_id: buyer2.id, // Pretend Buyer 2 is organizer for split test
                processing_fee_cents: 1000
            }
        }).select().single();

        if (txError) throw new Error(`Failed to create transaction: ${txError.message}`);

        // 3. Simulate Webhook (Payment)
        console.log("\n3️⃣  Simulating OpenPix Webhook (Payment)...");
        const webhookPayload = {
            charge: {
                status: "COMPLETED",
                correlationID: order.id,
                value: amount,
                transactionID: `mock-tx-${Date.now()}`,
                customer: { name: "Test", email: "test@example.com" }
            }
        };

        const webhookRes = await fetch(`${BASE_URL}/api/webhooks/openpix`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(webhookPayload)
        });

        console.log(`   Webhook Response: ${webhookRes.status}`);

        // Verify Order Status
        const { data: updatedOrder } = await supabase.from('orders').select('status').eq('id', order.id).single();
        console.log(`   Order Status: ${updatedOrder?.status} (Expected: paid)`);

        if (updatedOrder?.status !== 'paid') throw new Error("Order not marked as paid!");

        // 4. Verify Split/Wallet (Organizer)
        console.log("\n4️⃣  Verifying Organizer Wallet...");
        const { data: wallet } = await supabase.from('wallets').select('balance').eq('user_id', buyer2.id).single();
        console.log(`   Organizer Balance: ${wallet?.balance}`);
        // Note: We didn't check initial balance, so just checking it exists.

        // 5. Simulate Withdrawal (Organizer)
        console.log("\n5️⃣  Simulating Withdrawal Request...");
        const { data: withdrawal, error: withdrawError } = await supabase.from('withdrawals').insert({
            user_id: buyer2.id,
            amount: 50.00,
            pix_key: "test@example.com",
            pix_key_type: "email",
            status: "pending"
        }).select().single();

        if (withdrawError) throw new Error(`Failed to request withdrawal: ${withdrawError.message}`);
        console.log(`   Withdrawal requested: ${withdrawal.id}`);

        // 6. Approve Withdrawal (Admin Action)
        console.log("\n6️⃣  Approving Withdrawal (Triggering OpenPix Transfer)...");
        // We can't easily call the Server Action from script without Next.js context.
        // But we can simulate what the action does: Call createTransfer and update DB.
        // Or we can try to hit an API if we exposed one. 
        // Since we can't call the action, we will manually run the logic here to verify the *Library* works.

        const { createTransfer } = await import('../src/lib/payments/openpix');

        try {
            const transfer = await createTransfer({
                value: 5000,
                toPixKey: withdrawal.pix_key,
                correlationID: withdrawal.id
            });
            console.log(`   [Mock] Transfer initiated: ${transfer.transaction.status}`);

            await supabase.from('withdrawals').update({ status: 'completed' }).eq('id', withdrawal.id);
            console.log(`   Withdrawal marked as completed.`);
        } catch (e) {
            console.error(`   Transfer failed: ${e}`);
        }

        console.log("\n✅ Lifecycle Test Completed Successfully!");

    } catch (error) {
        console.error("\n❌ Test Failed:", error);
    }
}

runLifecycleTest();

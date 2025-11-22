import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createEvent() {
    const email = 'organizer2@test.com';

    // 1. Get User ID
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();
    const user = users.find(u => u.email === email);

    if (!user) {
        console.error('User not found:', email);
        return;
    }

    console.log('Found user:', user.id);

    // 2. Create Event
    const { data: event, error: eventError } = await supabase
        .from('events')
        .insert({
            title: 'Festa do Organizer 2',
            description: 'Melhor festa do ano',
            city: 'São Paulo',
            state: 'SP',
            event_date: new Date(Date.now() + 86400000 * 7).toISOString(), // +7 days
            category: 'Show',
            organizer_id: user.id,
            status: 'active',
            address: 'Rua Teste, 123',
            venue: 'Casa de Shows',
            banner_url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30'
        })
        .select()
        .single();

    if (eventError) {
        console.error('Error creating event:', eventError);
        return;
    }

    console.log('Event created:', event.id);

    // 3. Create Ticket Type
    const { error: ticketError } = await supabase
        .from('event_ticket_types')
        .insert({
            event_id: event.id,
            name: 'Pista',
            price: 100.00,
            total_quantity: 100,
            status: 'active'
        });

    if (ticketError) {
        console.error('Error creating ticket type:', ticketError);
        return;
    }

    console.log('Ticket type created.');
}

createEvent();

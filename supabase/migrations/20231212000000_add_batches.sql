-- Create ticket_batches table
create table public.ticket_batches (
  id uuid not null default gen_random_uuid (),
  event_id uuid not null references public.events (id) on delete cascade,
  name text not null,
  price numeric not null,
  quantity integer not null,
  end_date timestamp with time zone not null,
  created_at timestamp with time zone not null default now(),
  constraint ticket_batches_pkey primary key (id)
);

-- Add resale_enabled to events
alter table public.events add column resale_enabled boolean not null default true;

-- Enable RLS
alter table public.ticket_batches enable row level security;

-- Policy: Organizers can view their own batches
create policy "Organizers can view their own batches"
on public.ticket_batches
for select
using (
  exists (
    select 1 from public.events
    where events.id = ticket_batches.event_id
    and events.organizer_id = auth.uid()
  )
);

-- Policy: Organizers can insert batches for their events
create policy "Organizers can insert batches"
on public.ticket_batches
for insert
with check (
  exists (
    select 1 from public.events
    where events.id = ticket_batches.event_id
    and events.organizer_id = auth.uid()
  )
);

-- Policy: Public read access (for buying tickets)
create policy "Public can view active batches"
on public.ticket_batches
for select
using (true);

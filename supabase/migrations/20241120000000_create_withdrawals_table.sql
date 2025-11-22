create table if not exists withdrawals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  amount numeric not null,
  status text check (status in ('pending', 'approved', 'rejected', 'completed')) default 'pending',
  pix_key text not null,
  pix_key_type text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add RLS policies
alter table withdrawals enable row level security;

create policy "Users can view their own withdrawals"
  on withdrawals for select
  using (auth.uid() = user_id);

create policy "Users can insert their own withdrawals"
  on withdrawals for insert
  with check (auth.uid() = user_id);

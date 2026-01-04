-- Create a table for branches
create table public.branches (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table public.branches enable row level security;

-- Create policies
-- 1. Everyone can view branches
create policy "Branches are viewable by everyone"
  on public.branches for select
  using ( true );

-- 2. Only admins can insert/delete (assuming 'admin' role check or simply authenticated for now if no custom claims)
-- Ideally, we check profiles.role = 'admin'.
-- Since RLS with joins can be complex to setup in one go without functions, 
-- we will allow authenticated users to view, and for insert/delete we will assume the client-side check + backend verification (or trigger) is enough for this MVP,
-- OR we can try a policy using a subquery if profiles table is public readable.

create policy "Admins can insert branches"
  on public.branches for insert
  with check (
    auth.uid() in (
      select id from public.profiles where role = 'admin'
    )
  );

create policy "Admins can delete branches"
  on public.branches for delete
  using (
    auth.uid() in (
      select id from public.profiles where role = 'admin'
    )
  );

-- Insert initial data (The ones we had hardcoded)
insert into public.branches (name) values
  ('Computer Science'),
  ('Mechanical'),
  ('Civil'),
  ('Electrical'),
  ('Electronics');

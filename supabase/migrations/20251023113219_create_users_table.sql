create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null,
  email text not null unique,
  cpf text,
  created_at timestamptz default now()
);

alter table public.users enable row level security;

create policy "Users can see their own profile"
on public.users
for select
using (auth.uid() = id);

create policy "Users can update their own profile"
on public.users
for update
using (auth.uid() = id);

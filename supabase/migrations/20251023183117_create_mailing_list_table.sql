-- Migration: 20251023_create_mailing_list_table.sql

-- 1. Cria a tabela
create table if not exists public.mailing_list (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone_number numeric,
  postal_code char(8) not null,
  street text not null,
  number varchar(30) not null,
  complement text,
  neighborhood text not null,
  city text not null,
  state char(2) not null,
  created_at timestamptz default now()
);

-- 2. Ativa Row Level Security
alter table public.mailing_list enable row level security;

-- 3. Cria políticas (RLS)
-- Permitir que qualquer usuário autenticado possa inserir
create policy "authenticated users can insert mailing list"
on public.mailing_list
for insert
to authenticated
with check (true);

-- Permitir que qualquer usuário autenticado possa deletar
create policy "authenticated users can delete mailing list"
on public.mailing_list
for delete
to authenticated
using (true);

-- Permitir que qualquer usuário autenticado possa selecionar
create policy "authenticated users can select mailing list"
on public.mailing_list
for select
to authenticated
using (true);

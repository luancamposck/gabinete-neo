-- =====================================================================
-- Migration: create_users_rls_policies
-- Objetivo:
--   - Habilitar Row Level Security em public.users.
--   - Restringir SELECT/UPDATE ao próprio registro (auth.uid() = id).
--
-- Premissas:
--   - public.users já existe.
--   - Inserts e lookups por username são feitos via client admin
--     (service_role), que sempre contorna RLS — não precisam de policy.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1) Habilitar RLS
-- ---------------------------------------------------------------------
alter table public.users enable row level security;


-- ---------------------------------------------------------------------
-- 2) Policy: SELECT do próprio registro
-- ---------------------------------------------------------------------
create policy users_select_own
on public.users
for select
to authenticated
using (auth.uid() = id);


-- ---------------------------------------------------------------------
-- 3) Policy: UPDATE do próprio registro
-- ---------------------------------------------------------------------
create policy users_update_own
on public.users
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);


-- ---------------------------------------------------------------------
-- 4) Grants
--
-- O Supabase CLI restringe por padrão os privilégios de tabelas criadas
-- pela role postgres: anon/authenticated/service_role não recebem
-- SELECT/INSERT/UPDATE/DELETE automaticamente. RLS filtra linhas, mas
-- não substitui o GRANT de tabela.
-- ---------------------------------------------------------------------
grant select, update on public.users to authenticated;
grant select, insert, update, delete on public.users to service_role;

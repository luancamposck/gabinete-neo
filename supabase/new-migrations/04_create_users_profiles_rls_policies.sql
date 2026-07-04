-- =====================================================================
-- Migration: create_users_profiles_rls_policies
-- Objetivo:
--   - Habilitar Row Level Security em public.user_profiles.
--   - Restringir SELECT/UPDATE ao próprio registro (auth.uid() = user_id).
--
-- Premissas:
--   - public.user_profiles já existe.
--   - Leituras de perfis de outros membros da organização (lista de
--     membros, mapa de pessoas) passam a usar o client admin
--     (service_role), que sempre contorna RLS — não precisam de policy.
--     A autorização desses fluxos continua sendo feita na camada de
--     aplicação (ex.: checagem da permissão users.read).
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1) Habilitar RLS
-- ---------------------------------------------------------------------
alter table public.user_profiles enable row level security;


-- ---------------------------------------------------------------------
-- 2) Policy: SELECT do próprio registro
-- ---------------------------------------------------------------------
create policy user_profiles_select_own
on public.user_profiles
for select
to authenticated
using (auth.uid() = user_id);


-- ---------------------------------------------------------------------
-- 3) Policy: UPDATE do próprio registro
-- ---------------------------------------------------------------------
create policy user_profiles_update_own
on public.user_profiles
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

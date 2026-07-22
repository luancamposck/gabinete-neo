  -- =====================================================================
-- Migration: create_permissions_rls_policies
-- Objetivo:
--   - Habilitar Row Level Security em public.permissions.
--   - Permitir leitura do catálogo de permissões por usuários autenticados.
--
-- Premissas:
--   - public.permissions já existe.
--   - Permissions são controladas exclusivamente por migrations.
--   - Não há policies de INSERT/UPDATE/DELETE para usuários da aplicação.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1) Habilitar RLS
-- ---------------------------------------------------------------------
alter table public.permissions enable row level security;


-- ---------------------------------------------------------------------
-- 2) Policy: SELECT do catálogo de permissions
-- ---------------------------------------------------------------------
create policy permissions_select_all
on public.permissions
for select
to authenticated
using (true);


-- ---------------------------------------------------------------------
-- 3) Grants
--
-- O Supabase CLI restringe por padrão os privilégios de tabelas criadas
-- pela role postgres: anon/authenticated/service_role não recebem
-- SELECT/INSERT/UPDATE/DELETE automaticamente. RLS filtra linhas, mas
-- não substitui o GRANT de tabela.
-- ---------------------------------------------------------------------
grant select on public.permissions to authenticated;
grant select, insert, update, delete on public.permissions to service_role;

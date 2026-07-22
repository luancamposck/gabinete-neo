-- =====================================================================
-- Migration: create_role_permissions_rls_policies
-- Objetivo:
--   - Habilitar Row Level Security em public.role_permissions.
--
-- Premissas:
--   - public.role_permissions já existe.
--   - Todo acesso da aplicação passa pelo server (Server Actions/Route
--     Handlers), que usa o client admin (service_role) e faz a checagem
--     de autorização na camada de aplicação.
--   - Não há acesso direto via client (browser) a esta tabela, então não
--     há policy de SELECT/INSERT/UPDATE/DELETE para authenticated/anon:
--     a tabela fica bloqueada para esses roles por design.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1) Habilitar RLS
-- ---------------------------------------------------------------------
alter table public.role_permissions enable row level security;


-- ---------------------------------------------------------------------
-- 2) Grants
--
-- O Supabase CLI restringe por padrão os privilégios de tabelas criadas
-- pela role postgres: service_role não recebe SELECT/INSERT/UPDATE/
-- DELETE automaticamente, mesmo contornando RLS. anon/authenticated
-- não recebem grant nenhum: a tabela fica bloqueada para esses roles
-- por design.
-- ---------------------------------------------------------------------
grant select, insert, update, delete on public.role_permissions to service_role;

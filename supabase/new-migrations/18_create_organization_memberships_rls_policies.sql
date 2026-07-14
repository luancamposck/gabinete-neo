-- =====================================================================
-- Migration: create_organization_memberships_rls_policies
-- Objetivo:
--   - Habilitar Row Level Security em public.organization_memberships.
--
-- Premissas:
--   - public.organization_memberships já existe.
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
alter table public.organization_memberships enable row level security;

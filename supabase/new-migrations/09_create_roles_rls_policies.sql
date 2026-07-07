-- =====================================================================
-- Migration: create_roles_rls_policies
-- Objetivo:
--   - Habilitar Row Level Security em public.roles.
--
-- Premissas:
--   - public.roles já existe.
--   - Criação, alteração e leitura administrativa de roles passam pelo
--     client admin (service_role), que contorna RLS.
--   - Policies baseadas em membership/permissões serão adicionadas depois
--     que public.organization_memberships existir.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1) Habilitar RLS
-- ---------------------------------------------------------------------
alter table public.roles enable row level security;

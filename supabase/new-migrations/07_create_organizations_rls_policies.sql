-- =====================================================================
-- Migration: create_organizations_rls_policies
-- Objetivo:
--   - Habilitar Row Level Security em public.organizations.
--
-- Premissas:
--   - public.organizations já existe.
--   - Leituras e escritas administrativas de organizações são feitas via
--     client admin (service_role), que contorna RLS.
--   - Policies baseadas em membership serão adicionadas depois que
--     public.organization_memberships existir.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1) Habilitar RLS
-- ---------------------------------------------------------------------
alter table public.organizations enable row level security;

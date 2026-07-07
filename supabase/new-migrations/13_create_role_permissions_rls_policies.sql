-- =====================================================================
-- Migration: create_role_permissions_rls_policies
-- Objetivo:
--   - Habilitar Row Level Security em public.role_permissions.
--
-- Premissas:
--   - public.role_permissions já existe.
--   - Leituras administrativas passam pelo client admin (service_role).
--   - Policies baseadas em membership serão adicionadas depois que
--     public.organization_memberships existir.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1) Habilitar RLS
-- ---------------------------------------------------------------------
alter table public.role_permissions enable row level security;

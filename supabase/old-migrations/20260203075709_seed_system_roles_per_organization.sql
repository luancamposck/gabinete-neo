-- =====================================================================
-- Migration: seed_system_roles_per_organization
-- Objetivo:
--   - Para cada organização existente em public.organizations,
--     garantir a existência de 4 roles do sistema:
--       OWNER, ADMIN, STAFF, MEMBER
--   - Todas com:
--       is_system = true
--       is_active = true
--
-- Premissas:
--   - Tabelas public.organizations e public.roles já existem
--   - public.roles possui colunas:
--       id (uuid default gen_random_uuid())
--       organization_id (uuid)
--       name (text)
--       is_system (boolean)
--       is_active (boolean)
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1) OWNER
-- ---------------------------------------------------------------------
insert into public.roles (organization_id, name, is_system, is_active)
select o.id, 'OWNER', true, true
from public.organizations o
where not exists (
  select 1
  from public.roles r
  where r.organization_id = o.id
    and r.name = 'OWNER'
);


-- ---------------------------------------------------------------------
-- 2) ADMIN
-- ---------------------------------------------------------------------
insert into public.roles (organization_id, name, is_system, is_active)
select o.id, 'ADMIN', true, true
from public.organizations o
where not exists (
  select 1
  from public.roles r
  where r.organization_id = o.id
    and r.name = 'ADMIN'
);


-- ---------------------------------------------------------------------
-- 3) STAFF
-- ---------------------------------------------------------------------
insert into public.roles (organization_id, name, is_system, is_active)
select o.id, 'STAFF', true, true
from public.organizations o
where not exists (
  select 1
  from public.roles r
  where r.organization_id = o.id
    and r.name = 'STAFF'
);


-- ---------------------------------------------------------------------
-- 4) MEMBER
-- ---------------------------------------------------------------------
insert into public.roles (organization_id, name, is_system, is_active)
select o.id, 'MEMBER', true, true
from public.organizations o
where not exists (
  select 1
  from public.roles r
  where r.organization_id = o.id
    and r.name = 'MEMBER'
);

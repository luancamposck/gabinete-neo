-- =====================================================================
-- Migration: seed_permission_fleet_applications_manage
-- Objetivo:
--   - Garantir a existência da permissão:
--       - fleet.applications.manage
--   - Vincular essa permissão aos roles de sistema OWNER e ADMIN
--     em todas as organizações.
-- =====================================================================

insert into public.permissions (key, description)
values (
  'fleet.applications.manage',
  'Permite revisar (aprovar/rejeitar) candidaturas de motorista da frota da organização.'
)
on conflict (key) do update
set description = excluded.description;

insert into public.role_permissions (role_id, permission_id)
select
  r.id as role_id,
  p.id as permission_id
from public.roles r
join public.permissions p
  on p.key = 'fleet.applications.manage'
where r.name in ('OWNER', 'ADMIN')
on conflict (role_id, permission_id) do nothing;

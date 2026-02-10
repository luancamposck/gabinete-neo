-- =====================================================================
-- Migration: grant_permission_org_membership_status_update_to_admin
-- Objetivo:
--   - Garantir a existência da permissão:
--       - org.membership.status.update
--   - Vincular essa permissão também ao role de sistema ADMIN
--     em todas as organizações.
-- =====================================================================

insert into public.permissions (key, description)
values (
  'org.membership.status.update',
  'Permite ativar e inativar membership de membros não privilegiados da organização.'
)
on conflict (key) do update
set description = excluded.description;

insert into public.role_permissions (role_id, permission_id)
select
  r.id as role_id,
  p.id as permission_id
from public.roles r
join public.permissions p
  on p.key = 'org.membership.status.update'
where r.name = 'ADMIN'
on conflict (role_id, permission_id) do nothing;

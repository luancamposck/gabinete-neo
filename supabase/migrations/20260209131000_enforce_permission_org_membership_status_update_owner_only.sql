-- =====================================================================
-- Migration: enforce_permission_org_membership_status_update_owner_only
-- Objetivo:
--   - Garantir existência da permissão:
--       - org.membership.status.update
--   - Garantir que apenas OWNER tenha essa permissão
-- =====================================================================

insert into public.permissions (key, description)
values (
  'org.membership.status.update',
  'Permite ativar e inativar membership de membros não privilegiados da organização.'
)
on conflict (key) do update
set description = excluded.description;

with status_permission as (
  select id
  from public.permissions
  where key = 'org.membership.status.update'
)
delete from public.role_permissions rp
using public.roles r, status_permission p
where rp.role_id = r.id
  and rp.permission_id = p.id
  and r.name <> 'OWNER';

insert into public.role_permissions (role_id, permission_id)
select
  r.id as role_id,
  p.id as permission_id
from public.roles r
join public.permissions p
  on p.key = 'org.membership.status.update'
where r.name = 'OWNER'
on conflict (role_id, permission_id) do nothing;

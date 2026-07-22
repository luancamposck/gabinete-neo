-- =====================================================================
-- Migration: seed_permission_org_membership_status_update
-- Objetivo:
--   - Inserir (se não existir) a permissão:
--       - org.membership.status.update
--   - Vincular a permissão aos roles de sistema OWNER e ADMIN
--     em todas as organizações.
-- =====================================================================

insert into public.permissions (key, description)
values (
  'org.membership.status.update',
  'Permite ativar e inativar membership de membros da organização.'
)
on conflict (key) do nothing;

insert into public.role_permissions (role_id, permission_id)
select
  r.id as role_id,
  p.id as permission_id
from public.roles r
join public.permissions p
  on p.key = 'org.membership.status.update'
where r.name in ('OWNER', 'ADMIN')
on conflict (role_id, permission_id) do nothing;

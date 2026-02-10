-- =====================================================================
-- Migration: seed_permission_org_membership_role_privileged
-- Objetivo:
--   - Inserir (se não existir) a permissão:
--       - org.membership.role.privileged
--   - Vincular a permissão ao role de sistema OWNER em todas as organizações.
-- =====================================================================

insert into public.permissions (key, description)
values (
  'org.membership.role.privileged',
  'Permite atribuir e alterar cargos privilegiados (Owner/Admin).'
)
on conflict (key) do nothing;

insert into public.role_permissions (role_id, permission_id)
select
  r.id as role_id,
  p.id as permission_id
from public.roles r
join public.permissions p
  on p.key = 'org.membership.role.privileged'
where r.name in ('OWNER')
on conflict (role_id, permission_id) do nothing;

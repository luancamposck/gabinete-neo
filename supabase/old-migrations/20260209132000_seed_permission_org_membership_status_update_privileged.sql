-- =====================================================================
-- Migration: seed_permission_org_membership_status_update_privileged
-- Objetivo:
--   - Inserir (se não existir) a permissão:
--       - org.membership.status.update.privileged
--   - Vincular a permissão ao role de sistema OWNER em todas as organizações.
-- =====================================================================

insert into public.permissions (key, description)
values (
  'org.membership.status.update.privileged',
  'Permite ativar e inativar membership de qualquer membro da organização, exceto o próprio usuário.'
)
on conflict (key) do update
set description = excluded.description;

insert into public.role_permissions (role_id, permission_id)
select
  r.id as role_id,
  p.id as permission_id
from public.roles r
join public.permissions p
  on p.key = 'org.membership.status.update.privileged'
where r.name = 'OWNER'
on conflict (role_id, permission_id) do nothing;

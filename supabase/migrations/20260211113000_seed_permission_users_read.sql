-- =====================================================================
-- Migration: seed_permission_users_read
-- Objetivo:
--   - Garantir a existência da permissão:
--       - users.read
--   - Vincular essa permissão aos roles de sistema OWNER e ADMIN
--     em todas as organizações.
-- =====================================================================

insert into public.permissions (key, description)
values (
  'users.read',
  'Permite visualizar todos os usuários da organização no painel administrativo.'
)
on conflict (key) do update
set description = excluded.description;

insert into public.role_permissions (role_id, permission_id)
select
  r.id as role_id,
  p.id as permission_id
from public.roles r
join public.permissions p
  on p.key = 'users.read'
where r.name in ('OWNER', 'ADMIN')
on conflict (role_id, permission_id) do nothing;

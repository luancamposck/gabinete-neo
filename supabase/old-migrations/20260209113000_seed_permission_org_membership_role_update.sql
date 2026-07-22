-- =====================================================================
-- Migration: seed_permission_org_membership_role_update
-- Objetivo:
--   - Inserir (se não existir) a permissão:
--       - org.membership.role.update
--   - Vincular a permissão aos roles de sistema OWNER e ADMIN
--     em todas as organizações.
--
-- Premissas:
--   - public.permissions existe com key unique
--   - public.roles existe com organization_id + name
--   - public.role_permissions existe com PK (role_id, permission_id)
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1) Criar permissão org.membership.role.update
-- ---------------------------------------------------------------------
insert into public.permissions (key, description)
values (
  'org.membership.role.update',
  'Permite alterar o role de outros membros da organização.'
)
on conflict (key) do nothing;


-- ---------------------------------------------------------------------
-- 2) Vincular permissão aos roles OWNER e ADMIN
-- ---------------------------------------------------------------------
insert into public.role_permissions (role_id, permission_id)
select
  r.id as role_id,
  p.id as permission_id
from public.roles r
join public.permissions p
  on p.key = 'org.membership.role.update'
where r.name in ('OWNER', 'ADMIN')
on conflict (role_id, permission_id) do nothing;

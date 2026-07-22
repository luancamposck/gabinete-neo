-- =====================================================================
-- Migration: seed_permissions_roles_read_update
-- Objetivo:
--   - Inserir (ou atualizar descrição) das permissões:
--       - roles.read
--       - roles.update
--   - Vincular as permissões aos roles de sistema OWNER e ADMIN
--     em todas as organizações.
-- =====================================================================

insert into public.permissions (key, description)
values
  (
    'roles.read',
    'Permite visualizar cargos (roles) e permissões disponíveis na organização.'
  ),
  (
    'roles.update',
    'Permite criar, editar, ativar/inativar e gerenciar permissões de cargos (roles) da organização.'
  )
on conflict (key) do update
set description = excluded.description;

insert into public.role_permissions (role_id, permission_id)
select
  r.id as role_id,
  p.id as permission_id
from public.roles r
join public.permissions p
  on p.key in ('roles.read', 'roles.update')
where r.name in ('OWNER', 'ADMIN')
on conflict (role_id, permission_id) do nothing;

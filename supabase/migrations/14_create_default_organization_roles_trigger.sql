-- =====================================================================
-- Migration: create_default_organization_roles_trigger
-- Objetivo:
--   - Criar automaticamente as roles padrão do sistema sempre que uma
--     nova organization for criada.
--   - Atrelar as permissions padrão às roles do sistema.
--
-- Premissas:
--   - public.organizations já existe.
--   - public.roles já existe.
--   - public.permissions já existe.
--   - public.role_permissions já existe.
--   - As roles de sistema são OWNER, ADMIN, STAFF e MEMBER.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1) Function: public.handle_new_organization_default_roles()
-- ---------------------------------------------------------------------
create or replace function public.handle_new_organization_default_roles()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_owner_role_id uuid;
  v_admin_role_id uuid;
  v_staff_role_id uuid;
  v_member_role_id uuid;

  v_admin_permission_keys text[] := array[
    'org.admin.read',
    'org.admin.update',
    'users.read',
    'roles.read',
    'roles.update',
    'org.membership.role.update',
    'org.membership.status.update',
    'fleet.applications.manage'
  ];

  v_staff_permission_keys text[] := array[
    'org.admin.read',
    'users.read',
    'roles.read',
    'fleet.applications.manage'
  ];

  v_missing_permission_keys text[];
begin
  -- -------------------------------------------------------------------
  -- 1.1) Valida se todas as permissions usadas pela matriz padrão
  --      existem no catálogo antes de criar vínculos.
  -- -------------------------------------------------------------------
  select array_agg(required.key)
  into v_missing_permission_keys
  from (
    select distinct unnest(v_admin_permission_keys || v_staff_permission_keys) as key
  ) as required
  left join public.permissions p
    on p.key = required.key
  where p.key is null;

  if v_missing_permission_keys is not null then
    raise exception
      'missing_default_role_permissions: %',
      array_to_string(v_missing_permission_keys, ', ');
  end if;


  -- -------------------------------------------------------------------
  -- 1.2) Cria as roles padrão do sistema para a organization.
  -- -------------------------------------------------------------------
  insert into public.roles (
    organization_id,
    name,
    is_system,
    is_active
  )
  values (
    new.id,
    'OWNER',
    true,
    true
  )
  returning id into v_owner_role_id;

  insert into public.roles (
    organization_id,
    name,
    is_system,
    is_active
  )
  values (
    new.id,
    'ADMIN',
    true,
    true
  )
  returning id into v_admin_role_id;

  insert into public.roles (
    organization_id,
    name,
    is_system,
    is_active
  )
  values (
    new.id,
    'STAFF',
    true,
    true
  )
  returning id into v_staff_role_id;

  insert into public.roles (
    organization_id,
    name,
    is_system,
    is_active
  )
  values (
    new.id,
    'MEMBER',
    true,
    true
  )
  returning id into v_member_role_id;


  -- -------------------------------------------------------------------
  -- 1.3) Permite que a trigger de proteção, criada em migration posterior,
  --      reconheça esta operação como mutação interna controlada.
  --
  --      Isso é importante porque, depois da proteção de system roles,
  --      role_permissions de roles do sistema não devem ser alteradas por
  --      fluxos comuns da aplicação.
  -- -------------------------------------------------------------------
  perform set_config('app.allow_system_role_permission_mutation', 'on', true);


  -- -------------------------------------------------------------------
  -- 1.4) OWNER recebe todas as permissions existentes no catálogo.
  -- -------------------------------------------------------------------
  insert into public.role_permissions (
    role_id,
    permission_key
  )
  select
    v_owner_role_id,
    p.key
  from public.permissions p;


  -- -------------------------------------------------------------------
  -- 1.5) ADMIN recebe permissions administrativas sem privileged.
  -- -------------------------------------------------------------------
  insert into public.role_permissions (
    role_id,
    permission_key
  )
  select
    v_admin_role_id,
    p.key
  from public.permissions p
  where p.key = any(v_admin_permission_keys);


  -- -------------------------------------------------------------------
  -- 1.6) STAFF recebe permissions operacionais.
  -- -------------------------------------------------------------------
  insert into public.role_permissions (
    role_id,
    permission_key
  )
  select
    v_staff_role_id,
    p.key
  from public.permissions p
  where p.key = any(v_staff_permission_keys);


  -- -------------------------------------------------------------------
  -- 1.7) MEMBER nasce sem permissions administrativas explícitas.
  --      A membership ativa já representa vínculo básico com a organization.
  -- -------------------------------------------------------------------

  return new;
end;
$$;


comment on function public.handle_new_organization_default_roles() is
  'Cria roles padrão OWNER, ADMIN, STAFF e MEMBER com suas permissions iniciais para cada nova organização.';


-- ---------------------------------------------------------------------
-- 2) Trigger: on_organization_created_create_default_roles
-- ---------------------------------------------------------------------
create trigger on_organization_created_create_default_roles
after insert on public.organizations
for each row
execute function public.handle_new_organization_default_roles();

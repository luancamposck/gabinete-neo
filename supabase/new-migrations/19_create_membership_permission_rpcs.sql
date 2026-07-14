-- =====================================================================
-- Migration: create_membership_permission_rpcs
-- Objetivo:
--   - Criar as RPCs usadas pela aplicação para checar autorização:
--       public.has_membership_permission(uuid, uuid, text) -> boolean
--       public.list_membership_permissions(uuid, uuid) -> text[]
--
-- Premissas:
--   - public.organization_memberships já existe.
--   - public.roles já existe.
--   - public.role_permissions já existe (permission_key é o contrato
--     estável, sem indireção por permissions.id).
--   - Chamadas por:
--       src/modules/auth/server/repos/exists-permission-for-membership.repo.ts
--       src/modules/auth/server/repos/list-membership-permissions.repo.ts
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1) Function: public.has_membership_permission()
-- ---------------------------------------------------------------------
create or replace function public.has_membership_permission(
  p_organization_id uuid,
  p_user_id uuid,
  p_permission_key text
) returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.organization_memberships om
    join public.roles r
      on r.id = om.role_id
     and r.organization_id = om.organization_id
     and r.is_active = true
    join public.role_permissions rp
      on rp.role_id = r.id
     and rp.permission_key = p_permission_key
    where om.organization_id = p_organization_id
      and om.user_id = p_user_id
      and om.is_active = true
  );
$$;

comment on function public.has_membership_permission(uuid, uuid, text) is
  'Retorna true se o usuário tiver membership ativa na organização com role ativo (da mesma organização) contendo a permission informada.';


-- ---------------------------------------------------------------------
-- 2) Function: public.list_membership_permissions()
-- ---------------------------------------------------------------------
create or replace function public.list_membership_permissions(
  p_organization_id uuid,
  p_user_id uuid
) returns text[]
language sql
stable
as $$
  select coalesce(
    array_agg(distinct rp.permission_key order by rp.permission_key),
    array[]::text[]
  )
  from public.organization_memberships om
  join public.roles r
    on r.id = om.role_id
   and r.organization_id = om.organization_id
   and r.is_active = true
  join public.role_permissions rp
    on rp.role_id = r.id
  where om.organization_id = p_organization_id
    and om.user_id = p_user_id
    and om.is_active = true;
$$;

comment on function public.list_membership_permissions(uuid, uuid) is
  'Retorna todas as permission keys do usuário na organização informada (membership ativa + role ativo da mesma organização).';

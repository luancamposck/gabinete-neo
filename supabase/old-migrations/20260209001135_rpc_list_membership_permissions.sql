-- =====================================================================
-- Migration: rpc_list_membership_permissions
-- Objetivo:
--   - Criar (ou atualizar) a RPC:
--       public.list_membership_permissions(uuid, uuid) -> text[]
--   - Retornar todas as permission keys de um usuário em uma organização.
-- =====================================================================

create or replace function public.list_membership_permissions(
  p_organization_id uuid,
  p_user_id uuid
) returns text[]
language sql
stable
as $function$
  select coalesce(
    array_agg(distinct p.key order by p.key),
    array[]::text[]
  )
  from public.organization_memberships om
  join public.roles r
    on r.id = om.role_id
   and r.is_active = true
   and r.organization_id = om.organization_id
  join public.role_permissions rp
    on rp.role_id = r.id
  join public.permissions p
    on p.id = rp.permission_id
  where om.organization_id = p_organization_id
    and om.user_id = p_user_id
    and om.is_active = true;
$function$;

comment on function public.list_membership_permissions(uuid, uuid) is
  'Retorna todas as permission keys do usuário na organização informada (membership ativa + role ativo).';

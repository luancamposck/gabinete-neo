-- =====================================================================
-- Migration: rename_permission_org_membership_role_update_privileged
-- Objetivo:
--   - Renomear a permissão:
--       - org.membership.role.privileged
--     para:
--       - org.membership.role.update.privileged
--   - Preservar vínculos existentes (role_permissions)
--   - Garantir idempotência e descrição atualizada
-- =====================================================================

do $$
declare
  v_old_permission_id uuid;
  v_new_permission_id uuid;
begin
  select id
  into v_old_permission_id
  from public.permissions
  where key = 'org.membership.role.privileged'
  limit 1;

  select id
  into v_new_permission_id
  from public.permissions
  where key = 'org.membership.role.update.privileged'
  limit 1;

  if v_old_permission_id is null and v_new_permission_id is null then
    insert into public.permissions (key, description)
    values (
      'org.membership.role.update.privileged',
      'Permite atribuir e alterar cargos privilegiados (Owner/Admin).'
    );

  elsif v_old_permission_id is not null and v_new_permission_id is null then
    update public.permissions
    set
      key = 'org.membership.role.update.privileged',
      description = 'Permite atribuir e alterar cargos privilegiados (Owner/Admin).'
    where id = v_old_permission_id;

  elsif v_old_permission_id is not null and v_new_permission_id is not null then
    insert into public.role_permissions (role_id, permission_id)
    select rp.role_id, v_new_permission_id
    from public.role_permissions rp
    where rp.permission_id = v_old_permission_id
    on conflict (role_id, permission_id) do nothing;

    delete from public.role_permissions
    where permission_id = v_old_permission_id;

    delete from public.permissions
    where id = v_old_permission_id;

    update public.permissions
    set description = 'Permite atribuir e alterar cargos privilegiados (Owner/Admin).'
    where id = v_new_permission_id;

  else
    update public.permissions
    set description = 'Permite atribuir e alterar cargos privilegiados (Owner/Admin).'
    where id = v_new_permission_id;
  end if;
end $$;

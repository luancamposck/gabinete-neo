-- =====================================================================
-- Migration: protect_system_roles
-- Objetivo:
--   - Impedir remoção ou alteração destrutiva das roles de sistema.
--
-- Premissas:
--   - public.roles já existe.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1) Function: public.prevent_system_role_mutation()
-- ---------------------------------------------------------------------
create or replace function public.prevent_system_role_mutation()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if tg_op = 'DELETE' and old.is_system = true then
    raise exception 'system_roles_cannot_be_deleted';
  end if;

  if tg_op = 'UPDATE' and old.is_system = true then
    if new.name is distinct from old.name then
      raise exception 'system_role_name_cannot_be_changed';
    end if;

    if new.organization_id is distinct from old.organization_id then
      raise exception 'system_role_organization_cannot_be_changed';
    end if;

    if new.is_system is distinct from old.is_system then
      raise exception 'system_role_flag_cannot_be_changed';
    end if;

    if new.is_active is distinct from old.is_active then
      raise exception 'system_role_active_status_cannot_be_changed';
    end if;
  end if;

  return coalesce(new, old);
end;
$$;

comment on function public.prevent_system_role_mutation() is
  'Impede delete e alterações destrutivas em roles de sistema.';


-- ---------------------------------------------------------------------
-- 2) Trigger: on_system_roles_protected
-- ---------------------------------------------------------------------
create trigger on_system_roles_protected
before update or delete on public.roles
for each row
execute function public.prevent_system_role_mutation();

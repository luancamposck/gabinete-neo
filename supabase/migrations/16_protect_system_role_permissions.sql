-- =====================================================================
-- Migration: protect_system_role_permissions
-- Objetivo:
--   - Impedir insert/update/delete em public.role_permissions quando a
--     role envolvida for uma role de sistema (is_system = true), fora de
--     fluxos internos controlados.
--
-- Premissas:
--   - public.roles já existe.
--   - public.role_permissions já existe.
--   - Fluxos internos controlados (ex.: a trigger que cria as roles
--     padrão de uma organização) sinalizam a exceção via:
--       set_config('app.allow_system_role_permission_mutation', 'on', true)
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1) Function: public.prevent_system_role_permission_mutation()
-- ---------------------------------------------------------------------
create or replace function public.prevent_system_role_permission_mutation()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_role_id uuid;
  v_is_system boolean;
begin
  -- Permite a mutação quando um fluxo interno controlado já sinalizou
  -- explicitamente essa exceção para a sessão/transação atual.
  if coalesce(current_setting('app.allow_system_role_permission_mutation', true), 'off') = 'on' then
    return coalesce(new, old);
  end if;

  v_role_id := coalesce(new.role_id, old.role_id);

  select is_system
  into v_is_system
  from public.roles
  where id = v_role_id;

  if v_is_system then
    raise exception 'system_role_permissions_cannot_be_mutated';
  end if;

  return coalesce(new, old);
end;
$$;

comment on function public.prevent_system_role_permission_mutation() is
  'Impede insert/update/delete em role_permissions de roles de sistema fora de fluxos internos controlados.';


-- ---------------------------------------------------------------------
-- 2) Trigger: on_system_role_permissions_protected
-- ---------------------------------------------------------------------
create trigger on_system_role_permissions_protected
before insert or update or delete on public.role_permissions
for each row
execute function public.prevent_system_role_permission_mutation();

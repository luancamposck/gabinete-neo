-- =====================================================================
-- Migration: create_auth_user_sync_trigger
-- Objetivo:
--   - Criar automaticamente public.users quando um usuário nasce em auth.users.
--
-- Premissas:
--   - auth.users é gerenciada pelo Supabase Auth.
--   - public.users já existe.
--   - name e username são enviados em raw_user_meta_data pelo Auth Admin.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1) Function: public.handle_new_auth_user()
-- ---------------------------------------------------------------------
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_name text;
  v_username text;
begin
  -- Normaliza metadados vindos do Supabase Auth Admin:
  -- strings vazias viram null para falharem nas validações abaixo.
  v_name := nullif(trim(new.raw_user_meta_data ->> 'name'), '');
  v_username := nullif(trim(new.raw_user_meta_data ->> 'username'), '');

  -- Interrompe a criação do usuário auth se não houver nome público
  -- suficiente para criar o espelho obrigatório em public.users.
  if v_name is null then
    raise exception 'missing_user_name_metadata';
  end if;

  -- Username também é obrigatório porque public.users possui constraint
  -- NOT NULL/UNIQUE e ele é usado como identificador público.
  if v_username is null then
    raise exception 'missing_username_metadata';
  end if;

  -- Cria o registro público 1:1 usando o mesmo id de auth.users.
  -- As demais constraints de public.users seguem sendo validadas pelo banco.
  insert into public.users (
    id,
    email,
    name,
    username
  )
  values (
    new.id,
    new.email,
    v_name,
    v_username
  );

  -- Mantém o contrato de trigger AFTER INSERT: a linha de auth.users
  -- segue como foi recebida, apenas sincronizando o espelho público.
  return new;
end;
$$;

comment on function public.handle_new_auth_user() is
  'Cria o registro público 1:1 em public.users quando um usuário nasce em auth.users.';


-- ---------------------------------------------------------------------
-- 2) Trigger: on_auth_user_created
-- ---------------------------------------------------------------------
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_auth_user();

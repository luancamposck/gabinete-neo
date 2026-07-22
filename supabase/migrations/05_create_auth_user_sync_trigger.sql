-- =====================================================================
-- Migration: create_auth_user_sync_trigger
-- Objetivo:
--   - Criar automaticamente public.users E public.user_profiles quando
--     um usuário nasce em auth.users, na mesma transação do INSERT.
--
-- Premissas:
--   - auth.users é gerenciada pelo Supabase Auth.
--   - public.users já existe.
--   - public.user_profiles já existe.
--   - name, username e os campos de perfil/endereço (phone, cep, street,
--     number, complement, neighborhood, city, state) são enviados em
--     raw_user_meta_data pelo Auth Admin
--     (ver src/modules/auth/server/repos/create-user.admin.repo.ts).
--   - Unicidade de username e phone é pré-validada em camada de
--     aplicação antes de admin.createUser() (ver
--     src/modules/users/server/services/check-username-available.service.ts
--     e src/modules/users/profiles/server/services/check-phone-available.service.ts).
--     As constraints UNIQUE do banco continuam como última linha de
--     defesa; se dispararem aqui, a Auth Admin API devolve um erro
--     opaco, mas nenhum usuário órfão fica em auth.users, porque
--     qualquer exceção nesta trigger reverte o INSERT inteiro.
--   - Esta trigger não cria membership (organization/role): isso
--     depende de contexto (qual organização, qual papel) que nem
--     sempre existe neste INSERT — ex.: usuário já existente entrando
--     em uma nova organização não passa por aqui. Membership continua
--     sendo responsabilidade de RPCs/steps dedicados.
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

  v_phone text;
  v_cep text;
  v_street text;
  v_number text;
  v_complement text;
  v_neighborhood text;
  v_city text;
  v_state text;
begin
  -- Normaliza metadados vindos do Supabase Auth Admin:
  -- strings vazias viram null para falharem nas validações abaixo.
  v_name := nullif(trim(new.raw_user_meta_data ->> 'name'), '');
  v_username := nullif(trim(new.raw_user_meta_data ->> 'username'), '');

  v_phone := nullif(trim(new.raw_user_meta_data ->> 'phone'), '');
  v_cep := nullif(trim(new.raw_user_meta_data ->> 'cep'), '');
  v_street := nullif(trim(new.raw_user_meta_data ->> 'street'), '');
  v_number := nullif(trim(new.raw_user_meta_data ->> 'number'), '');
  v_neighborhood := nullif(trim(new.raw_user_meta_data ->> 'neighborhood'), '');
  v_city := nullif(trim(new.raw_user_meta_data ->> 'city'), '');
  v_state := nullif(trim(new.raw_user_meta_data ->> 'state'), '');

  -- Complemento é opcional em public.user_profiles: fica fora do guard.
  v_complement := nullif(trim(new.raw_user_meta_data ->> 'complement'), '');

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

  -- Guard único e combinado para o bloco de perfil/endereço: formato de
  -- cada campo (regex de phone/cep, UF válida, etc.) já é validado por
  -- Zod antes desta trigger rodar, e é reforçado pelas CHECK/NOT NULL
  -- constraints de public.user_profiles. Este guard cobre só o caminho
  -- "não deveria acontecer" (bloco inteiro ausente), pra ficar visível
  -- e debugável nos logs do Postgres em vez de estourar como uma
  -- violação de NOT NULL sem contexto.
  if v_phone is null
    or v_cep is null
    or v_street is null
    or v_number is null
    or v_neighborhood is null
    or v_city is null
    or v_state is null
  then
    raise exception 'missing_user_profile_metadata';
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

  -- Cria o perfil/endereço na mesma transação: se qualquer constraint
  -- de public.user_profiles (UNIQUE phone, CHECK cep/state, NOT NULL)
  -- falhar aqui, o INSERT inteiro em auth.users é revertido junto —
  -- não sobra usuário nem perfil parcial.
  insert into public.user_profiles (
    user_id,
    phone,
    cep,
    street,
    number,
    complement,
    neighborhood,
    city,
    state
  )
  values (
    new.id,
    v_phone,
    v_cep,
    v_street,
    v_number,
    v_complement,
    v_neighborhood,
    v_city,
    v_state
  );

  -- Mantém o contrato de trigger AFTER INSERT: a linha de auth.users
  -- segue como foi recebida, apenas sincronizando os espelhos públicos.
  return new;
end;
$$;

comment on function public.handle_new_auth_user() is
  'Cria public.users e public.user_profiles atomicamente quando um usuário nasce em auth.users.';


-- ---------------------------------------------------------------------
-- 2) Trigger: on_auth_user_created
-- ---------------------------------------------------------------------
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_auth_user();

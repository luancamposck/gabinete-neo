-- =====================================================================
-- Migration: rpc_register_driver_application
-- Objetivo:
--   - Criar a RPC transacional public.register_driver_application(...)
--     que, numa única transação:
--       1) valida a placa e a existência de candidatura pendente do usuário
--       2) garante a membership ativa do usuário na organização (MEMBER)
--       3) cria a driver_application com status 'pending'
--
-- Retorno:
--   - application_id uuid  -> id da candidatura criada (null em erro)
--   - joined_now boolean   -> true se a membership foi criada/reativada agora
--   - error_code text      -> null em sucesso; 'plate_taken',
--                             'application_pending_exists' ou 'infra_error'
--
-- Premissas:
--   - public.driver_applications já existe (migration anterior).
--   - public.organization_memberships usa role_id (FK roles.id) +
--     invited_by_user_id (NÃO existe mais a coluna role text).
--   - public.roles possui o role de sistema 'MEMBER' por organização.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1) Cria ou substitui a função RPC
--
-- Notas:
--   - security definer + search_path fixo para rodar com privilégios
--     controlados e evitar hijack de search_path.
--   - Validações ANTES de qualquer insert para preservar atomicidade
--     lógica: retornar error_code não deve deixar side effects.
-- ---------------------------------------------------------------------
create or replace function public.register_driver_application(
  p_organization_id uuid,
  p_user_id uuid,
  p_plate text,
  p_vehicle_type text,
  p_vehicle_model text,
  p_vehicle_year integer,
  p_vehicle_color text,
  p_crlv_path text,
  p_cnh_path text,
  p_invited_by_user_id uuid,
  out application_id uuid,
  out joined_now boolean,
  out error_code text
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_member_role_id uuid;
  v_is_active_member boolean;
begin
  -- Defaults do retorno
  application_id := null;
  joined_now := false;
  error_code := null;

  -- -------------------------------------------------------------------
  -- 1.1) Valida placa: já existe candidatura ativa (pending/approved)
  --      para a mesma organização + placa?
  -- -------------------------------------------------------------------
  if exists (
    select 1
    from public.driver_applications da
    where da.organization_id = p_organization_id
      and da.plate = p_plate
      and da.status in ('pending', 'approved')
  ) then
    error_code := 'plate_taken';
    return;
  end if;

  -- -------------------------------------------------------------------
  -- 1.2) O próprio usuário já possui candidatura pendente nesta org?
  -- -------------------------------------------------------------------
  if exists (
    select 1
    from public.driver_applications da
    where da.organization_id = p_organization_id
      and da.user_id = p_user_id
      and da.status = 'pending'
  ) then
    error_code := 'application_pending_exists';
    return;
  end if;

  -- -------------------------------------------------------------------
  -- 1.3) Garante membership ativa. Se o usuário não é membro ativo,
  --      cria (ou reativa) o vínculo com o role de sistema MEMBER.
  -- -------------------------------------------------------------------
  select om.is_active
  into v_is_active_member
  from public.organization_memberships om
  where om.organization_id = p_organization_id
    and om.user_id = p_user_id;

  if v_is_active_member is distinct from true then
    -- Resolve o role de sistema MEMBER ativo da organização.
    select r.id
    into v_member_role_id
    from public.roles r
    where r.organization_id = p_organization_id
      and r.name = 'MEMBER'
      and r.is_active = true
    limit 1;

    -- Sem role MEMBER não é possível prosseguir (infra inconsistente).
    if v_member_role_id is null then
      error_code := 'infra_error';
      return;
    end if;

    insert into public.organization_memberships (
      organization_id,
      user_id,
      role_id,
      is_active,
      invited_by_user_id
    )
    values (
      p_organization_id,
      p_user_id,
      v_member_role_id,
      true,
      p_invited_by_user_id
    )
    on conflict (organization_id, user_id) do update
      set is_active = true;

    joined_now := true;
  end if;

  -- -------------------------------------------------------------------
  -- 1.4) Cria a candidatura (status 'pending').
  -- -------------------------------------------------------------------
  insert into public.driver_applications (
    organization_id,
    user_id,
    plate,
    vehicle_type,
    vehicle_model,
    vehicle_year,
    vehicle_color,
    crlv_document_path,
    cnh_document_path,
    status
  )
  values (
    p_organization_id,
    p_user_id,
    p_plate,
    p_vehicle_type,
    p_vehicle_model,
    p_vehicle_year,
    p_vehicle_color,
    p_crlv_path,
    p_cnh_path,
    'pending'
  )
  returning id into application_id;

  return;
end;
$$;


comment on function public.register_driver_application(
  uuid, uuid, text, text, text, integer, text, text, text, uuid
) is
  'Cria membership ativa (se necessário) + driver_application pending numa única transação. Retorna application_id, joined_now e error_code (plate_taken | application_pending_exists | infra_error).';


-- ---------------------------------------------------------------------
-- 2) Privilégios de execução
--
-- Como a função é security definer e realiza escritas sensíveis, revoga
-- o execute de PUBLIC/anon/authenticated e concede apenas ao service role
-- (chamada via admin client no backend).
-- ---------------------------------------------------------------------
revoke execute on function public.register_driver_application(
  uuid, uuid, text, text, text, integer, text, text, text, uuid
) from public;

revoke execute on function public.register_driver_application(
  uuid, uuid, text, text, text, integer, text, text, text, uuid
) from anon;

revoke execute on function public.register_driver_application(
  uuid, uuid, text, text, text, integer, text, text, text, uuid
) from authenticated;

grant execute on function public.register_driver_application(
  uuid, uuid, text, text, text, integer, text, text, text, uuid
) to service_role;

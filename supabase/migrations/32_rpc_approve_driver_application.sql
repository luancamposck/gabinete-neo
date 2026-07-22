-- =====================================================================
-- Migration: rpc_approve_driver_application
-- Objetivo:
--   - Criar a RPC transacional public.approve_driver_application(...)
--     que, numa única transação:
--       1) verifica a existência e o status da candidatura
--       2) cria o registro em public.drivers a partir da candidatura
--       3) atualiza a candidatura para status 'approved' (revisor + data)
--
-- Retorno:
--   - driver_id uuid    -> id do motorista criado (null em erro)
--   - error_code text   -> null em sucesso; 'not_found' ou 'already_reviewed'
--
-- Premissas:
--   - public.driver_applications e public.drivers já existem.
--   - Chamada por:
--       src/modules/fleet/server/repos/approve-driver-application.admin.repo.ts
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1) Function: public.approve_driver_application()
--
-- Notas:
--   - security definer + search_path fixo para rodar com privilégios
--     controlados e evitar hijack de search_path.
--   - A candidatura é lida com FOR UPDATE para travar a linha e evitar
--     aprovação concorrente da mesma candidatura (dois inserts em
--     public.drivers para a mesma driver_application_id).
-- ---------------------------------------------------------------------
create or replace function public.approve_driver_application(
  p_application_id uuid,
  p_reviewer_user_id uuid,
  out driver_id uuid,
  out error_code text
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_app public.driver_applications%rowtype;
begin
  -- Defaults do retorno
  driver_id := null;
  error_code := null;

  -- -------------------------------------------------------------------
  -- 1.1) Carrega a candidatura (lock para aprovação concorrente).
  --      Inexistente -> 'not_found'.
  -- -------------------------------------------------------------------
  select *
  into v_app
  from public.driver_applications da
  where da.id = p_application_id
  for update;

  if not found then
    error_code := 'not_found';
    return;
  end if;

  -- -------------------------------------------------------------------
  -- 1.2) Só candidaturas 'pending' podem ser aprovadas.
  --      Qualquer outro status -> 'already_reviewed'.
  -- -------------------------------------------------------------------
  if v_app.status <> 'pending' then
    error_code := 'already_reviewed';
    return;
  end if;

  -- -------------------------------------------------------------------
  -- 1.3) Cria o motorista a partir dos dados da candidatura.
  -- -------------------------------------------------------------------
  insert into public.drivers (
    organization_id,
    user_id,
    driver_application_id,
    plate,
    vehicle_type,
    vehicle_model,
    vehicle_year,
    vehicle_color
  )
  values (
    v_app.organization_id,
    v_app.user_id,
    v_app.id,
    v_app.plate,
    v_app.vehicle_type,
    v_app.vehicle_model,
    v_app.vehicle_year,
    v_app.vehicle_color
  )
  returning id into driver_id;

  -- -------------------------------------------------------------------
  -- 1.4) Marca a candidatura como aprovada (revisor + data).
  -- -------------------------------------------------------------------
  update public.driver_applications
  set status = 'approved',
      reviewed_by_user_id = p_reviewer_user_id,
      reviewed_at = now()
  where id = v_app.id;

  return;
end;
$$;

comment on function public.approve_driver_application(uuid, uuid) is
  'Aprova uma driver_application pending: cria linha em drivers e atualiza a candidatura para approved (revisor + data), numa única transação. Retorna driver_id e error_code (not_found | already_reviewed).';


-- ---------------------------------------------------------------------
-- 2) Privilégios de execução
--
-- Diferente das RPCs de leitura de permissão (19_create_membership_
-- permission_rpcs.sql), esta função é security definer e realiza
-- escritas sensíveis (materializa motorista + revisa candidatura), e é
-- chamada apenas via admin client no backend. Revoga o execute de
-- PUBLIC/anon/authenticated e concede apenas ao service_role.
-- ---------------------------------------------------------------------
revoke execute on function public.approve_driver_application(uuid, uuid) from public;

revoke execute on function public.approve_driver_application(uuid, uuid) from anon;

revoke execute on function public.approve_driver_application(uuid, uuid) from authenticated;

grant execute on function public.approve_driver_application(uuid, uuid) to service_role;

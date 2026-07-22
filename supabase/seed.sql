-- =====================================================================
-- Seed: dev environment
-- Objetivo:
--   - Criar uma organization padrão para desenvolvimento local
--     (app_domain = 'localhost').
--   - Criar um usuário owner@localhost.dev e vinculá-lo como OWNER dessa
--     organization.
--   - Criar usuários de teste adicionais (um por role/estado relevante)
--     para exercitar fluxos como gestão de membros e cadastro de
--     motoristas. Todos usam a senha password123.
--
-- Premissas:
--   - Roda após todas as migrations em supabase/new-migrations, via
--     `npm run db:reset` (supabase db reset --local).
--   - on_auth_user_created (05_create_auth_user_sync_trigger.sql) cria
--     public.users e public.user_profiles a partir de raw_user_meta_data.
--   - on_organization_created_create_default_roles
--     (14_create_default_organization_roles_trigger.sql) cria as roles
--     OWNER/ADMIN/STAFF/MEMBER automaticamente ao inserir a organization.
-- =====================================================================

do $$
declare
  v_user_id uuid := gen_random_uuid();
  v_organization_id uuid;
  v_owner_role_id uuid;
begin
  -- ---------------------------------------------------------------------
  -- 1) Auth user (dispara handle_new_auth_user via trigger)
  -- ---------------------------------------------------------------------
  insert into auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change
  )
  values (
    '00000000-0000-0000-0000-000000000000',
    v_user_id,
    'authenticated',
    'authenticated',
    'owner@localhost.dev',
    extensions.crypt('password123', extensions.gen_salt('bf')),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    jsonb_build_object(
      'name', 'Owner User',
      'username', 'owner',
      'phone', '11999999999',
      'cep', '01001000',
      'street', 'Praca da Se',
      'number', '1',
      'complement', null,
      'neighborhood', 'Se',
      'city', 'Sao Paulo',
      'state', 'SP'
    ),
    now(),
    now(),
    '',
    '',
    '',
    ''
  );

  -- ---------------------------------------------------------------------
  -- 2) Organization (dispara handle_new_organization_default_roles)
  -- ---------------------------------------------------------------------
  insert into public.organizations (
    name,
    slug,
    app_domain
  )
  values (
    'Organizacao Local',
    'organizacao-local',
    'localhost'
  )
  returning id into v_organization_id;

  select id
  into v_owner_role_id
  from public.roles
  where organization_id = v_organization_id
    and name = 'OWNER';

  -- ---------------------------------------------------------------------
  -- 3) Membership: owner@localhost.dev como OWNER da organization
  -- ---------------------------------------------------------------------
  insert into public.memberships (
    organization_id,
    user_id,
    role_id
  )
  values (
    v_organization_id,
    v_user_id,
    v_owner_role_id
  );
end $$;


-- =====================================================================
-- Helper: pg_temp.seed_org_member
-- Objetivo:
--   - Evitar repetir o boilerplate de insert em auth.users (que dispara
--     handle_new_auth_user e cria public.users/public.user_profiles) para
--     cada um dos usuários de teste abaixo.
--
-- Premissas:
--   - Função de escopo de sessão (schema pg_temp): não precisa de DROP
--     FUNCTION ao final, some sozinha quando a conexão do `psql -f
--     seed.sql` (usada pelo `supabase db reset`) encerra.
-- =====================================================================
create function pg_temp.seed_org_member(
  p_organization_id uuid,
  p_role_id uuid,
  p_email text,
  p_username text,
  p_name text,
  p_phone text,
  p_cep text,
  p_street text,
  p_number text,
  p_neighborhood text,
  p_city text,
  p_state text,
  p_is_active boolean default true,
  p_invited_by_user_id uuid default null
)
returns uuid
language plpgsql
as $$
declare
  v_user_id uuid := gen_random_uuid();
begin
  insert into auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change
  )
  values (
    '00000000-0000-0000-0000-000000000000',
    v_user_id,
    'authenticated',
    'authenticated',
    p_email,
    extensions.crypt('password123', extensions.gen_salt('bf')),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    jsonb_build_object(
      'name', p_name,
      'username', p_username,
      'phone', p_phone,
      'cep', p_cep,
      'street', p_street,
      'number', p_number,
      'complement', null,
      'neighborhood', p_neighborhood,
      'city', p_city,
      'state', p_state
    ),
    now(),
    now(),
    '',
    '',
    '',
    ''
  );

  insert into public.memberships (
    organization_id,
    user_id,
    role_id,
    is_active,
    invited_by_user_id
  )
  values (
    p_organization_id,
    v_user_id,
    p_role_id,
    p_is_active,
    p_invited_by_user_id
  );

  return v_user_id;
end;
$$;


-- =====================================================================
-- Seed: usuários de teste adicionais
-- Objetivo:
--   - Cobrir roles (ADMIN, STAFF, MEMBER) e estados de MEMBER relevantes
--     para testar gestão de membros e o fluxo de cadastro de motoristas:
--     motorista aprovado, pendente de revisão, rejeitado, membro sem
--     candidatura, membro inativo e membro indicado por outro (referral).
-- =====================================================================
do $$
declare
  v_organization_id uuid;

  v_admin_role_id uuid;
  v_staff_role_id uuid;
  v_member_role_id uuid;

  v_admin_user_id uuid;
  v_staff_user_id uuid;
  v_member_user_id uuid;
  v_driver_user_id uuid;
  v_driver_pending_user_id uuid;
  v_driver_rejected_user_id uuid;
  v_inactive_user_id uuid;
  v_referred_user_id uuid;

  v_approved_application_id uuid;
begin
  select id
  into v_organization_id
  from public.organizations
  where app_domain = 'localhost';

  select id into v_admin_role_id
  from public.roles
  where organization_id = v_organization_id and name = 'ADMIN';

  select id into v_staff_role_id
  from public.roles
  where organization_id = v_organization_id and name = 'STAFF';

  select id into v_member_role_id
  from public.roles
  where organization_id = v_organization_id and name = 'MEMBER';

  -- ---------------------------------------------------------------------
  -- 1) Usuários de teste (auth.users + membership)
  -- ---------------------------------------------------------------------
  v_admin_user_id := pg_temp.seed_org_member(
    v_organization_id, v_admin_role_id,
    'admin@localhost.dev', 'admin', 'Admin User',
    '11988880001', '01310100', 'Avenida Paulista', '900',
    'Bela Vista', 'Sao Paulo', 'SP'
  );

  v_staff_user_id := pg_temp.seed_org_member(
    v_organization_id, v_staff_role_id,
    'staff@localhost.dev', 'staff', 'Staff User',
    '11988880002', '04538132', 'Avenida Brigadeiro Faria Lima', '1500',
    'Itaim Bibi', 'Sao Paulo', 'SP'
  );

  v_member_user_id := pg_temp.seed_org_member(
    v_organization_id, v_member_role_id,
    'member@localhost.dev', 'member', 'Member User',
    '11988880003', '05407000', 'Rua Teodoro Sampaio', '250',
    'Pinheiros', 'Sao Paulo', 'SP'
  );

  v_driver_user_id := pg_temp.seed_org_member(
    v_organization_id, v_member_role_id,
    'member.driver@localhost.dev', 'driver', 'Driver User',
    '11988880004', '03310000', 'Rua Bresser', '100',
    'Bras', 'Sao Paulo', 'SP'
  );

  v_driver_pending_user_id := pg_temp.seed_org_member(
    v_organization_id, v_member_role_id,
    'member.driver.pending@localhost.dev', 'driver_pending', 'Pending Driver',
    '11988880005', '02011000', 'Rua Voluntarios da Patria', '50',
    'Santana', 'Sao Paulo', 'SP'
  );

  v_driver_rejected_user_id := pg_temp.seed_org_member(
    v_organization_id, v_member_role_id,
    'member.driver.rejected@localhost.dev', 'driver_rejected', 'Rejected Driver',
    '11988880006', '04101300', 'Rua Vergueiro', '3000',
    'Vila Mariana', 'Sao Paulo', 'SP'
  );

  v_inactive_user_id := pg_temp.seed_org_member(
    v_organization_id, v_member_role_id,
    'member.inactive@localhost.dev', 'member_inactive', 'Inactive Member',
    '11988880007', '05422030', 'Rua Cardeal Arcoverde', '700',
    'Pinheiros', 'Sao Paulo', 'SP',
    p_is_active := false
  );

  v_referred_user_id := pg_temp.seed_org_member(
    v_organization_id, v_member_role_id,
    'member.referred@localhost.dev', 'member_referred', 'Referred Member',
    '11988880008', '03164000', 'Rua Padre Antonio Tomas', '80',
    'Mooca', 'Sao Paulo', 'SP',
    p_invited_by_user_id := v_member_user_id
  );

  -- ---------------------------------------------------------------------
  -- 2) Driver applications: aprovada, pendente e rejeitada
  --
  -- Paths de crlv_document_path/cnh_document_path são fictícios: as
  -- colunas são apenas texto (sem FK para storage.objects), então não
  -- exigem arquivo real no bucket fleet-documents.
  -- ---------------------------------------------------------------------
  insert into public.driver_applications (
    organization_id, user_id, plate, vehicle_type,
    vehicle_model, vehicle_year, vehicle_color,
    crlv_document_path, cnh_document_path,
    status, reviewed_by_user_id, reviewed_at
  )
  values (
    v_organization_id, v_driver_user_id, 'ABC1D23', 'car',
    'Chevrolet Onix', 2022, 'Prata',
    'seed/member-driver/crlv.pdf', 'seed/member-driver/cnh.pdf',
    'approved', v_admin_user_id, now()
  )
  returning id into v_approved_application_id;

  insert into public.driver_applications (
    organization_id, user_id, plate, vehicle_type,
    vehicle_model, vehicle_year, vehicle_color,
    crlv_document_path, cnh_document_path,
    status
  )
  values (
    v_organization_id, v_driver_pending_user_id, 'DEF4G56', 'motorcycle',
    'Honda CG 160', 2023, 'Preta',
    'seed/member-driver-pending/crlv.pdf', 'seed/member-driver-pending/cnh.pdf',
    'pending'
  );

  insert into public.driver_applications (
    organization_id, user_id, plate, vehicle_type,
    vehicle_model, vehicle_year, vehicle_color,
    crlv_document_path, cnh_document_path,
    status, reviewed_by_user_id, reviewed_at
  )
  values (
    v_organization_id, v_driver_rejected_user_id, 'GHI7J89', 'van',
    'Fiat Fiorino', 2019, 'Branca',
    'seed/member-driver-rejected/crlv.pdf', 'seed/member-driver-rejected/cnh.pdf',
    'rejected', v_staff_user_id, now()
  );

  -- ---------------------------------------------------------------------
  -- 3) Driver materializado a partir da candidatura aprovada
  -- ---------------------------------------------------------------------
  insert into public.drivers (
    organization_id, user_id, driver_application_id,
    plate, vehicle_type, vehicle_model, vehicle_year, vehicle_color
  )
  values (
    v_organization_id, v_driver_user_id, v_approved_application_id,
    'ABC1D23', 'car', 'Chevrolet Onix', 2022, 'Prata'
  );

  -- ---------------------------------------------------------------------
  -- 4) Referral: member.referred foi indicado por member
  -- ---------------------------------------------------------------------
  insert into public.referrals (
    organization_id, inviter_user_id, invited_user_id, relationship_to_inviter
  )
  values (
    v_organization_id, v_member_user_id, v_referred_user_id, 'Friend'
  );
end $$;

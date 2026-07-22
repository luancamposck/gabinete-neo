-- =====================================================================
-- Migration: create_fleet_driver_applications_and_drivers
-- Objetivo:
--   - Criar as tabelas base do módulo de frota:
--       public.driver_applications  (candidaturas de motorista)
--       public.drivers              (motoristas aprovados)
--   - Garantir integridade referencial com organizations e users.
--
-- Premissas:
--   - Tabelas public.organizations e public.users já existem.
--   - Função public.handle_updated_at() já existe (trigger updated_at).
--   - Extensão pgcrypto disponível para gen_random_uuid().
-- =====================================================================

create extension if not exists "pgcrypto" with schema extensions;


-- ---------------------------------------------------------------------
-- 1) Tabela public.driver_applications
--
-- Candidatura de um usuário para se tornar motorista de uma organização.
-- Guarda os dados do veículo e os paths dos documentos (CRLV/CNH).
-- ---------------------------------------------------------------------
create table public.driver_applications (
  -- ID da candidatura
  id uuid not null default gen_random_uuid(),

  -- Organização alvo da candidatura
  organization_id uuid not null,

  -- Usuário candidato (public.users.id)
  user_id uuid not null,

  -- Placa do veículo (normalizada em uppercase pela aplicação)
  plate text not null,

  -- Tipo do veículo
  vehicle_type text not null,

  -- Dados opcionais do veículo
  vehicle_model text null,
  vehicle_year integer null,
  vehicle_color text null,

  -- Paths dos documentos no bucket privado 'fleet-documents'
  crlv_document_path text not null,
  cnh_document_path text not null,

  -- Status da candidatura
  status text not null default 'pending',

  -- Revisor e data da revisão (preenchidos ao aprovar/rejeitar)
  reviewed_by_user_id uuid null,
  reviewed_at timestamptz null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint driver_applications_pkey primary key (id),

  constraint driver_applications_status_check
    check (status in ('pending', 'approved', 'rejected')),

  constraint driver_applications_vehicle_type_check
    check (vehicle_type in ('car', 'motorcycle', 'van', 'truck')),

  constraint driver_applications_organization_id_fkey
    foreign key (organization_id)
    references public.organizations (id)
    on delete cascade,

  constraint driver_applications_user_id_fkey
    foreign key (user_id)
    references public.users (id)
    on delete cascade,

  constraint driver_applications_reviewed_by_user_id_fkey
    foreign key (reviewed_by_user_id)
    references public.users (id)
    on delete set null
);

comment on table public.driver_applications is
  'Candidaturas de motorista por organização, com dados do veículo e documentos.';
comment on column public.driver_applications.plate is
  'Placa do veículo, normalizada em uppercase sem separadores pela aplicação.';
comment on column public.driver_applications.status is
  'Status da candidatura: pending, approved ou rejected.';
comment on column public.driver_applications.crlv_document_path is
  'Path do CRLV no bucket privado fleet-documents.';
comment on column public.driver_applications.cnh_document_path is
  'Path da CNH no bucket privado fleet-documents.';

-- Placa única por organização enquanto a candidatura estiver ativa
-- (pending ou approved), permitindo reenvio após rejected.
create unique index driver_applications_org_plate_active_uidx
  on public.driver_applications (organization_id, plate)
  where status in ('pending', 'approved');

-- Índice para listar candidaturas por organização e status.
create index driver_applications_organization_id_status_idx
  on public.driver_applications (organization_id, status);

-- Índices nas FKs restantes.
create index driver_applications_user_id_idx
  on public.driver_applications (user_id);

create index driver_applications_reviewed_by_user_id_idx
  on public.driver_applications (reviewed_by_user_id);

create trigger on_driver_applications_updated
before update on public.driver_applications
for each row
execute function public.handle_updated_at();


-- ---------------------------------------------------------------------
-- 2) Tabela public.drivers
--
-- Motorista aprovado, criado a partir de uma driver_application.
-- ---------------------------------------------------------------------
create table public.drivers (
  -- ID do motorista
  id uuid not null default gen_random_uuid(),

  -- Organização dona do motorista
  organization_id uuid not null,

  -- Usuário motorista (public.users.id)
  user_id uuid not null,

  -- Candidatura de origem
  driver_application_id uuid not null,

  -- Dados do veículo (copiados da candidatura na aprovação)
  plate text not null,
  vehicle_type text not null,
  vehicle_model text null,
  vehicle_year integer null,
  vehicle_color text null,

  -- Flag para ativar/desativar o motorista sem deletar
  is_active boolean not null default true,

  created_at timestamptz not null default now(),

  constraint drivers_pkey primary key (id),

  constraint drivers_vehicle_type_check
    check (vehicle_type in ('car', 'motorcycle', 'van', 'truck')),

  constraint drivers_organization_id_fkey
    foreign key (organization_id)
    references public.organizations (id)
    on delete cascade,

  constraint drivers_user_id_fkey
    foreign key (user_id)
    references public.users (id)
    on delete cascade,

  constraint drivers_driver_application_id_fkey
    foreign key (driver_application_id)
    references public.driver_applications (id)
    on delete cascade
);

comment on table public.drivers is
  'Motoristas aprovados por organização, derivados de driver_applications.';
comment on column public.drivers.driver_application_id is
  'FK para a candidatura de origem (public.driver_applications.id).';

-- Índice para listar motoristas por organização e status.
create index drivers_organization_id_is_active_idx
  on public.drivers (organization_id, is_active);

-- Índices nas FKs restantes.
create index drivers_user_id_idx
  on public.drivers (user_id);

create index drivers_driver_application_id_idx
  on public.drivers (driver_application_id);

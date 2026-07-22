-- =====================================================================
-- Migration: create_driver_applications
-- Objetivo:
--   - Criar public.driver_applications: candidatura de um usuário para
--     se tornar motorista de uma organização.
--
-- Premissas:
--   - public.organizations e public.users já existem.
--   - public.handle_updated_at() já existe.
--   - Extensão pgcrypto disponível para gen_random_uuid().
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1) Enum: public.driver_application_status
-- ---------------------------------------------------------------------
create type public.driver_application_status as enum (
  'pending',
  'approved',
  'rejected'
);


-- ---------------------------------------------------------------------
-- 2) Enum: public.driver_vehicle_type
-- ---------------------------------------------------------------------
create type public.driver_vehicle_type as enum (
  'car',
  'motorcycle',
  'van',
  'truck'
);


-- ---------------------------------------------------------------------
-- 3) Table: public.driver_applications
-- ---------------------------------------------------------------------
create table public.driver_applications (
  -- Identificador único da candidatura
  id uuid not null default gen_random_uuid(),

  -- Organização alvo da candidatura
  organization_id uuid not null,

  -- Usuário candidato
  user_id uuid not null,

  -- Placa do veículo, normalizada em uppercase pela aplicação
  plate text not null,

  -- Tipo do veículo
  vehicle_type public.driver_vehicle_type not null,

  -- Dados opcionais do veículo
  vehicle_model text null,
  vehicle_year integer null,
  vehicle_color text null,

  -- Paths dos documentos no bucket privado fleet-documents
  crlv_document_path text not null,
  cnh_document_path text not null,

  -- Status da candidatura
  status public.driver_application_status not null default 'pending',

  -- Revisor e data da revisão. Preenchidos já na criação quando a
  -- candidatura nasce aprovada (alguém com fleet.applications.manage
  -- adicionando um motorista diretamente); preenchidos depois, na
  -- revisão, quando a candidatura nasce pending (auto-candidatura).
  reviewed_by_user_id uuid null,
  reviewed_at timestamptz null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint driver_applications_pkey primary key (id),

  -- Formato de placa brasileira: padrão antigo (AAA9999) ou Mercosul
  -- (AAA9A99), sempre uppercase e sem separadores.
  constraint driver_applications_plate_check
    check (plate ~ '^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$'),

  constraint driver_applications_organization_id_fkey
    foreign key (organization_id)
    references public.organizations (id)
    on update cascade
    on delete cascade,

  constraint driver_applications_user_id_fkey
    foreign key (user_id)
    references public.users (id)
    on update cascade
    on delete cascade,

  constraint driver_applications_reviewed_by_user_id_fkey
    foreign key (reviewed_by_user_id)
    references public.users (id)
    on update cascade
    on delete set null
) tablespace pg_default;

comment on table public.driver_applications is
  'Candidaturas de motorista por organização, com dados do veículo e documentos.';

comment on column public.driver_applications.plate is
  'Placa do veículo, normalizada em uppercase sem separadores pela aplicação.';

comment on column public.driver_applications.crlv_document_path is
  'Path do CRLV no bucket privado fleet-documents.';

comment on column public.driver_applications.cnh_document_path is
  'Path da CNH no bucket privado fleet-documents.';

comment on column public.driver_applications.reviewed_by_user_id is
  'Usuário que revisou a candidatura (aprovou/rejeitou). Preenchido na criação quando a candidatura já nasce aprovada.';


-- ---------------------------------------------------------------------
-- 4) Indexes
--
-- Placa única por organização enquanto a candidatura estiver ativa
-- (pending ou approved), permitindo reenvio após rejected.
-- ---------------------------------------------------------------------
create unique index driver_applications_organization_id_plate_active_uidx
  on public.driver_applications using btree (organization_id, plate)
  where status in ('pending', 'approved');

create index if not exists driver_applications_organization_id_status_idx
  on public.driver_applications using btree (organization_id, status);

create index if not exists driver_applications_user_id_idx
  on public.driver_applications using btree (user_id);

create index if not exists driver_applications_reviewed_by_user_id_idx
  on public.driver_applications using btree (reviewed_by_user_id);


-- ---------------------------------------------------------------------
-- 5) Trigger: updated_at
-- ---------------------------------------------------------------------
create trigger on_driver_applications_updated
before update on public.driver_applications
for each row
execute function public.handle_updated_at();

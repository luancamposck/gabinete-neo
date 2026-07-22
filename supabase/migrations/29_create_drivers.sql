-- =====================================================================
-- Migration: create_drivers
-- Objetivo:
--   - Criar public.drivers: motoristas ativos de uma organização,
--     materializados a partir de uma driver_application aprovada.
--
-- Premissas:
--   - public.organizations, public.users e public.driver_applications
--     já existem.
--   - public.driver_vehicle_type já existe (criado em
--     27_create_driver_applications.sql).
--   - public.handle_updated_at() já existe.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1) Table: public.drivers
-- ---------------------------------------------------------------------
create table public.drivers (
  -- Identificador único do motorista
  id uuid not null default gen_random_uuid(),

  -- Organização dona do motorista
  organization_id uuid not null,

  -- Usuário motorista
  user_id uuid not null,

  -- Candidatura de origem (approved) que gerou este registro
  driver_application_id uuid not null,

  -- Dados do veículo, copiados da candidatura no momento da criação
  plate text not null,
  vehicle_type public.driver_vehicle_type not null,
  vehicle_model text null,
  vehicle_year integer null,
  vehicle_color text null,

  -- Liga/desliga o motorista sem apagar o histórico
  is_active boolean not null default true,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint drivers_pkey primary key (id),

  -- Mesmo formato de placa brasileira usado em driver_applications.
  constraint drivers_plate_check
    check (plate ~ '^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$'),

  constraint drivers_organization_id_fkey
    foreign key (organization_id)
    references public.organizations (id)
    on update cascade
    on delete cascade,

  constraint drivers_user_id_fkey
    foreign key (user_id)
    references public.users (id)
    on update cascade
    on delete cascade,

  constraint drivers_driver_application_id_fkey
    foreign key (driver_application_id)
    references public.driver_applications (id)
    on update cascade
    on delete cascade
) tablespace pg_default;

comment on table public.drivers is
  'Motoristas ativos por organização, materializados a partir de uma driver_application approved.';

comment on column public.drivers.driver_application_id is
  'Candidatura de origem (public.driver_applications.id) que gerou este motorista.';

comment on column public.drivers.is_active is
  'Liga/desliga o motorista sem apagar o registro.';


-- ---------------------------------------------------------------------
-- 2) Indexes
-- ---------------------------------------------------------------------
create index if not exists drivers_organization_id_is_active_idx
  on public.drivers using btree (organization_id, is_active);

create index if not exists drivers_user_id_idx
  on public.drivers using btree (user_id);

create index if not exists drivers_driver_application_id_idx
  on public.drivers using btree (driver_application_id);


-- ---------------------------------------------------------------------
-- 3) Trigger: updated_at
-- ---------------------------------------------------------------------
create trigger on_drivers_updated
before update on public.drivers
for each row
execute function public.handle_updated_at();

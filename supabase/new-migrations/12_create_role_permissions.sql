-- =====================================================================
-- Migration: create_role_permissions
-- Objetivo:
--   - Criar a tabela de vínculo entre roles e permissions.
--
-- Premissas:
--   - public.roles já existe.
--   - public.permissions já existe.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1) Table: public.role_permissions
-- ---------------------------------------------------------------------
create table public.role_permissions (
  -- Role que recebe a permission
  role_id uuid not null,

  -- Permission concedida à role
  permission_key text not null,

  -- Data/hora de criação do vínculo
  created_at timestamptz not null default now(),

  -- Impede duplicidade do mesmo vínculo role + permission
  constraint role_permissions_pkey
    primary key (role_id, permission_key),

  -- Mantém vínculo com roles
  constraint role_permissions_role_id_fkey
    foreign key (role_id)
    references public.roles (id)
    on update cascade
    on delete cascade,

  -- Mantém vínculo com permissions
  constraint role_permissions_permission_key_fkey
    foreign key (permission_key)
    references public.permissions (key)
    on update cascade
    on delete restrict
) tablespace pg_default;


comment on table public.role_permissions is
  'Vínculo entre roles e permissions.';

comment on column public.role_permissions.role_id is
  'Role que recebe a permission.';

comment on column public.role_permissions.permission_key is
  'Permission concedida à role.';

comment on column public.role_permissions.created_at is
  'Timestamp de criação do vínculo.';


-- ---------------------------------------------------------------------
-- 2) Indexes
-- ---------------------------------------------------------------------
create index if not exists role_permissions_role_id_idx
  on public.role_permissions using btree (role_id);

create index if not exists role_permissions_permission_key_idx
  on public.role_permissions using btree (permission_key);

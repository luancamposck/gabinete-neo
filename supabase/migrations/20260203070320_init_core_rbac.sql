-- =====================================================================
-- Migration: init_core_rbac
-- Objetivo:
--   - Criar as tabelas base de RBAC:
--       public.roles
--       public.permissions
--       public.role_permissions (tabela de junção)
--   - Garantir integridade referencial com public.organizations
--
-- Premissas:
--   - Tabela public.organizations já existe e possui PK (id uuid)
--   - A extensão pgcrypto pode ser usada para gen_random_uuid()
-- =====================================================================


-- ---------------------------------------------------------------------
-- 0) Extensão necessária para UUID default (gen_random_uuid)
-- ---------------------------------------------------------------------
create extension if not exists "pgcrypto" with schema extensions;


-- ---------------------------------------------------------------------
-- 1) Tabela public.roles
--
-- Requisitos:
--   - id
--   - organization_id (FK organizations.id)
--   - name (text not null)
--   - is_system boolean
--   - is_active boolean
-- ---------------------------------------------------------------------
create table public.roles (
  -- ID do role
  id uuid not null default gen_random_uuid(),

  -- Organização dona do role
  organization_id uuid not null,

  -- Nome do role (ex.: "admin", "member", "viewer")
  name text not null,

  -- Indica se é um role do sistema (ex.: roles padrão)
  is_system boolean not null default false,

  -- Flag para ativar/desativar o role sem deletar
  is_active boolean not null default true,

  constraint roles_pkey primary key (id),

  constraint roles_organization_id_fkey
    foreign key (organization_id)
    references public.organizations (id)
    on delete cascade
);

comment on table public.roles is
  'Roles (cargos/perfis) por organização, usados em RBAC.';

comment on column public.roles.id is
  'Chave primária do role (UUID).';

comment on column public.roles.organization_id is
  'FK para public.organizations.id (organização dona do role).';

comment on column public.roles.name is
  'Nome do role (texto), ex.: admin, member, viewer.';

comment on column public.roles.is_system is
  'Indica se é um role do sistema (padrão do app), e não criado pelo usuário.';

comment on column public.roles.is_active is
  'Indica se o role está ativo (true) ou desativado (false).';

create index roles_organization_id_idx
on public.roles (organization_id);


-- ---------------------------------------------------------------------
-- 2) Tabela public.permissions
--
-- Requisitos:
--   - id
--   - key unique (ex.: tasks.read)
--   - description (text not null)
-- ---------------------------------------------------------------------
create table public.permissions (
  -- ID da permissão
  id uuid not null default gen_random_uuid(),

  -- Chave única da permissão (ex.: "tasks.read", "tasks.write")
  key text not null,

  -- Descrição humana da permissão
  description text not null,

  constraint permissions_pkey primary key (id),

  constraint permissions_key_key unique (key)
);

comment on table public.permissions is
  'Permissões do sistema (ex.: tasks.read), usadas em RBAC.';

comment on column public.permissions.id is
  'Chave primária da permissão (UUID).';

comment on column public.permissions.key is
  'Chave única da permissão (texto). Ex.: tasks.read.';

comment on column public.permissions.description is
  'Descrição textual (humana) do que a permissão permite.';


-- ---------------------------------------------------------------------
-- 3) Tabela public.role_permissions (junção N:N)
--
-- Requisitos:
--   - role_id (FK roles.id)
--   - permission_id (FK permissions.id)
-- ---------------------------------------------------------------------
create table public.role_permissions (
  role_id uuid not null,
  permission_id uuid not null,

  -- Evita duplicidade da mesma permissão no mesmo role
  constraint role_permissions_pkey primary key (role_id, permission_id),

  constraint role_permissions_role_id_fkey
    foreign key (role_id)
    references public.roles (id)
    on delete cascade,

  constraint role_permissions_permission_id_fkey
    foreign key (permission_id)
    references public.permissions (id)
    on delete cascade
);

comment on table public.role_permissions is
  'Tabela de junção N:N entre roles e permissions (RBAC).';

comment on column public.role_permissions.role_id is
  'FK para public.roles.id.';

comment on column public.role_permissions.permission_id is
  'FK para public.permissions.id.';

create index role_permissions_permission_id_idx
on public.role_permissions (permission_id);

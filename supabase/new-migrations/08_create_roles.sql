-- =====================================================================
-- Migration: create_roles
-- Objetivo:
--   - Criar a tabela de papéis/cargos por organização.
--   - Suportar roles de sistema imutáveis e roles customizadas no futuro.
--
-- Premissas:
--   - public.organizations já existe.
--   - public.handle_updated_at() já existe.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1) Table: public.roles
-- ---------------------------------------------------------------------
create table public.roles (
  -- Identificador único do papel
  id uuid not null default gen_random_uuid(),

  -- Organização dona do papel
  organization_id uuid not null,

  -- Nome técnico/exibido do papel
  name text not null,

  -- Indica se é um papel do sistema
  is_system boolean not null default false,

  -- Indica se o papel está ativo
  is_active boolean not null default true,

  -- Data/hora de criação do registro
  created_at timestamptz not null default now(),

  -- Data/hora da última atualização do registro
  updated_at timestamptz not null default now(),

  -- Garante que cada role tenha um identificador único
  constraint roles_pkey primary key (id),

  -- Mantém a role vinculada à organização
  constraint roles_organization_id_fkey
    foreign key (organization_id)
    references public.organizations (id)
    on update cascade
    on delete cascade,

  -- Impede duas roles com o mesmo nome dentro da mesma organização
  constraint roles_organization_name_key
    unique (organization_id, name),

  -- Mantém nomes mínimos e evita string vazia
  constraint roles_name_check
    check (char_length(trim(name)) between 2 and 40),

  -- Limita os nomes reservados do sistema
  constraint roles_system_name_check
    check (
      is_system = false
      or name in ('OWNER', 'ADMIN', 'STAFF', 'MEMBER')
    )
) tablespace pg_default;


comment on table public.roles is
  'Papéis/cargos disponíveis dentro de uma organização.';

comment on column public.roles.id is
  'Identificador único da role.';

comment on column public.roles.organization_id is
  'Organização dona da role.';

comment on column public.roles.name is
  'Nome da role, como OWNER, ADMIN, STAFF, MEMBER ou uma role customizada.';

comment on column public.roles.is_system is
  'Indica se a role é uma role padrão do sistema.';

comment on column public.roles.is_active is
  'Indica se a role está ativa para uso.';

comment on column public.roles.created_at is
  'Timestamp de criação do registro.';

comment on column public.roles.updated_at is
  'Timestamp atualizado automaticamente em UPDATE.';


-- ---------------------------------------------------------------------
-- 2) Indexes
-- ---------------------------------------------------------------------
create index if not exists roles_organization_id_idx
  on public.roles using btree (organization_id);

create index if not exists roles_system_lookup_idx
  on public.roles using btree (organization_id, name, is_system, is_active);


-- ---------------------------------------------------------------------
-- 3) Trigger: updated_at
-- ---------------------------------------------------------------------
create trigger on_roles_updated
before update on public.roles
for each row
execute function public.handle_updated_at();

-- =====================================================================
-- Migration: create_table_organizations
-- Objetivo:
--   - Criar a tabela public.organizations (tenant / cliente do SaaS)
--   - Guardar informações básicas da organização
--   - Relacionar quem criou a organização com public.users
--   - Adicionar trigger para manter updated_at atualizado
--
-- Premissas:
--   - A função public.handle_updated_at() já existe
--   - A tabela public.users já foi criada em migration anterior
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1) Tabela public.organizations
--
-- Conceito:
--   - Representa um "cliente" da plataforma (empresa, time, grupo).
--   - Cada organização pode ter vários usuários (via organization_memberships).
--
-- Campos principais:
--   - id: identificador único da organização (UUID gerado no banco).
--   - name: nome legível da organização (ex.: "Acme LTDA").
--   - slug: identificador amigável pra URL (ex.: "acme", "meu-time").
--   - created_by_user_id: usuário que criou a organização.
--   - is_active: se a organização está ativa no sistema.
--   - created_at / updated_at: timestamps de auditoria.
-- ---------------------------------------------------------------------
create table public.organizations (
  -- Identificador único da organização
  id uuid not null default gen_random_uuid(),

  -- Nome legível da organização (ex.: razão social ou nome fantasia)
  name text not null,

  -- Slug único para uso em URL/subdomínio (ex.: "acme", "time-do-joao")
  slug text not null,

  -- Usuário que criou essa organização (opcionalmente pode ser null se o usuário for removido)
  created_by_user_id uuid null,

  -- Indica se a organização está ativa no sistema
  is_active boolean not null default true,

  -- Data/hora de criação do registro
  created_at timestamp with time zone not null default now(),

  -- Data/hora da última atualização do registro
  updated_at timestamp with time zone not null default now(),

  -- Chave primária na coluna id
  constraint organizations_pkey primary key (id),

  -- Garante que não exista duas organizações com o mesmo slug
  constraint organizations_slug_key unique (slug),

  -- Relaciona o criador com public.users.id
  constraint organizations_created_by_user_id_fkey
    foreign key (created_by_user_id)
    references public.users (id)
    on delete set null
) tablespace pg_default;


comment on table public.organizations is
  'Tabela de tenants / clientes do SaaS (empresas, times ou grupos).';

comment on column public.organizations.id is
  'Identificador único (UUID) da organização.';

comment on column public.organizations.name is
  'Nome legível da organização (ex.: razão social ou nome fantasia).';

comment on column public.organizations.slug is
  'Identificador único e amigável para URL, ex.: "acme", "time-do-joao".';

comment on column public.organizations.created_by_user_id is
  'Usuário que criou a organização, referenciando public.users.id.';

comment on column public.organizations.is_active is
  'Indica se a organização está ativa no sistema.';

comment on column public.organizations.created_at is
  'Timestamp de criação da organização. Definido automaticamente como now().';

comment on column public.organizations.updated_at is
  'Timestamp da última atualização da organização. Atualizado via trigger.';


-- ---------------------------------------------------------------------
-- 2) Trigger: on_organizations_updated
--
-- Objetivo:
--   - Atualizar automaticamente updated_at em toda operação de UPDATE.
--
-- Observação:
--   - Usa a função genérica public.handle_updated_at() definida anteriormente.
--   - Padrão de nome de trigger: on_<table>_updated
-- ---------------------------------------------------------------------
create trigger on_organizations_updated
before update on public.organizations
for each row
execute function public.handle_updated_at();

-- =====================================================================
-- Migration: create_organizations
-- Objetivo:
--   - Criar a tabela de organizações/tenants da aplicação.
--
-- Premissas:
--   - public.handle_updated_at() já existe.
--   - Tenancy é resolvida exclusivamente por app_domain.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1) Table: public.organizations
-- ---------------------------------------------------------------------
create table public.organizations (
  -- Identificador único da organização
  id uuid not null default gen_random_uuid(),

  -- Nome exibido para a organização
  name text not null,

  -- Domínio usado para resolver o tenant atual
  app_domain text not null,

  -- Descrição pública/administrativa da organização
  description text null,

  -- Caminho da imagem da organização no storage
  image_path text null,

  -- Indica se a organização está ativa
  is_active boolean not null default true,

  -- Data/hora de criação do registro
  created_at timestamptz not null default now(),

  -- Data/hora da última atualização do registro
  updated_at timestamptz not null default now(),

  -- Garante que cada organização tenha um único registro
  constraint organizations_pkey primary key (id),

  -- Evita colisão de tenancy por domínio
  constraint organizations_app_domain_unique unique (app_domain),

  -- Mantém no banco o tamanho aceito pela validação server-side
  constraint organizations_name_check
    check (char_length(trim(name)) between 2 and 120),

  -- Impede domínio vazio no identificador de tenant
  constraint organizations_app_domain_check
    check (char_length(trim(app_domain)) > 0),

  -- Mantém no banco o limite aceito pela validação server-side
  constraint organizations_description_check
    check (description is null or char_length(description) <= 300)
) tablespace pg_default;

comment on table public.organizations is
  'Organizações/tenants da aplicação, resolvidas por app_domain.';

comment on column public.organizations.id is
  'Identificador único da organização.';

comment on column public.organizations.name is
  'Nome exibido para a organização.';

comment on column public.organizations.app_domain is
  'Domínio usado para resolver a organização atual.';

comment on column public.organizations.description is
  'Descrição textual opcional da organização.';

comment on column public.organizations.image_path is
  'Caminho opcional da imagem da organização no storage.';

comment on column public.organizations.is_active is
  'Indica se a organização está ativa.';

comment on column public.organizations.created_at is
  'Timestamp de criação do registro.';

comment on column public.organizations.updated_at is
  'Timestamp atualizado automaticamente em UPDATE.';


-- ---------------------------------------------------------------------
-- 2) Trigger: updated_at
-- ---------------------------------------------------------------------
create trigger on_organizations_updated
before update on public.organizations
for each row
execute function public.handle_updated_at();

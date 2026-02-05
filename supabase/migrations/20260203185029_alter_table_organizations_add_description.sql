-- =====================================================================
-- Migration: alter_table_organizations_add_description
-- Objetivo:
--   - Adicionar a coluna description na tabela public.organizations
--
-- Premissas:
--   - Tabela public.organizations já existe
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1) Adiciona a coluna description (nullable por padrão)
-- ---------------------------------------------------------------------
alter table public.organizations
add column if not exists description text null;

comment on column public.organizations.description is
  'Descrição textual da organização (bio/resumo).';

-- =====================================================================
-- Migration: add_organizations_image_path
-- Objetivo:
--   - Adicionar a coluna image_path (text) em public.organizations
--   - Coluna opcional (nullable)
--
-- Premissas:
--   - Tabela public.organizations já existe
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1) Adiciona a coluna image_path como NULLABLE
-- ---------------------------------------------------------------------
alter table public.organizations
add column if not exists image_path text null;

comment on column public.organizations.image_path is
  'Caminho/URL da imagem da organização (ex.: storage path).';

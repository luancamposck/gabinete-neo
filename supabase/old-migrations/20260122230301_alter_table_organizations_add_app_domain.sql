-- =====================================================================
-- Migration: alter_table_organizations_add_app_domain
-- Objetivo:
--   - Adicionar a coluna public.organizations.app_domain
--   - Tornar a coluna obrigatória (NOT NULL)
--   - Garantir unicidade global na tabela (UNIQUE)
--
-- Premissas:
--   - A tabela public.organizations já existe
--   - A tabela está vazia neste momento (podemos aplicar NOT NULL direto)
--
-- Decisões:
--   - Tipo: text (string sem limite arbitrário)
--   - Sem normalização (lower/trim) nesta migration
--   - Sem CHECK de formato nesta migration
--   - Sem índice explícito (UNIQUE já cria índice automaticamente)
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) Adicionar coluna app_domain (NOT NULL)
--
-- Conceito:
--   - app_domain representa o domínio/subdomínio que identifica a organização
--     na aplicação (ex.: "acme.com" ou "acme.seudominio.com").
--   - O valor será usado para resolver tenancy por host de forma determinística:
--       host -> organization
--
-- Detalhes do tipo:
--   - text é a escolha padrão no Postgres para strings.
--   - evita limites artificiais (ex.: varchar(255)) que não agregam aqui.
-- ---------------------------------------------------------------------
alter table public.organizations
  add column app_domain text not null;

-- ---------------------------------------------------------------------
-- 2) Garantir unicidade de app_domain
--
-- Por que UNIQUE?
--   - Um domínio precisa apontar para exatamente uma organização.
--   - Impede colisões (duas orgs com o mesmo app_domain) e mantém integridade.
--
-- Nota:
--   - UNIQUE cria um índice internamente, então não é necessário criar outro.
-- ---------------------------------------------------------------------
alter table public.organizations
  add constraint organizations_app_domain_unique unique (app_domain);

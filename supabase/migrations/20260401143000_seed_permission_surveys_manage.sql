-- =====================================================================
-- Migration: seed_permission_surveys_manage
-- Objetivo:
--   - Garantir a existência da permissão:
--       - surveys.manage
-- =====================================================================

insert into public.permissions (key, description)
values (
  'surveys.manage',
  'Permite criar, editar, publicar, encerrar e visualizar resultados de pesquisas da organização.'
)
on conflict (key) do update
set description = excluded.description;

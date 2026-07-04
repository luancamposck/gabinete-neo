-- =====================================================================
-- Migration: init_infra_helpers
-- Objetivo:
--   - Preparar helpers compartilhados usados pelas migrations seguintes.
--
-- Premissas:
--   - Projeto Supabase limpo, sem tabelas de domínio.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 0) Extensions
-- ---------------------------------------------------------------------
create extension if not exists "pgcrypto" with schema extensions;


-- ---------------------------------------------------------------------
-- 1) Shared trigger helpers
-- ---------------------------------------------------------------------
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

comment on function public.handle_updated_at() is
  'Atualiza automaticamente a coluna updated_at em triggers BEFORE UPDATE.';

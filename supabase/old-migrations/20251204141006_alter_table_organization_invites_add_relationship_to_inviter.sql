-- =====================================================================
-- Migration: alter_table_organization_invites_add_relationship_to_inviter
-- Objetivo:
--   - Adicionar coluna relationship_to_inviter em public.organization_invites
--   - Armazenar a relação do convidado com quem convidou (ex.: irmão, amigo, etc.)
--   - Preencher registros existentes com 'OTHER'
--   - Tornar a coluna NOT NULL
-- =====================================================================

-- 1) Adicionar coluna como NULL inicialmente
--    (para evitar problemas com linhas existentes)
ALTER TABLE public.organization_invites
  ADD COLUMN relationship_to_inviter text;

-- 2) Backfill: preencher linhas existentes com 'OTHER'
UPDATE public.organization_invites
SET relationship_to_inviter = 'OTHER'
WHERE relationship_to_inviter IS NULL;

-- 3) Tornar NOT NULL (todas as linhas já têm valor)
ALTER TABLE public.organization_invites
  ALTER COLUMN relationship_to_inviter SET NOT NULL;

-- 4) (Opcional) Comentário de documentação
COMMENT ON COLUMN public.organization_invites.relationship_to_inviter IS
  'Relação do convidado com quem originou o convite (ex.: irmão, primo, amigo, etc.).';

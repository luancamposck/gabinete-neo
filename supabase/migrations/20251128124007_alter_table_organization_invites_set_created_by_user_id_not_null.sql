-- =====================================================================
-- Migration: alter_table_organization_invites_set_created_by_user_id_not_null
-- Objetivo:
--   - Tornar obrigatória a coluna created_by_user_id em public.organization_invites
--   - Garantir que todo convite/pedido tenha um "dono" (quem convidou)
--
-- Premissas:
--   - A coluna created_by_user_id já existe em public.organization_invites
--   - A tabela ainda não possui dados inválidos (linhas com created_by_user_id IS NULL)
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) Tornar created_by_user_id NOT NULL
--
-- Observação:
--   - Se já existirem linhas com created_by_user_id = NULL,
--     este comando irá falhar.
--   - Em ambiente de desenvolvimento inicial, isso normalmente não é um problema.
-- ---------------------------------------------------------------------
alter table public.organization_invites
  alter column created_by_user_id set not null;

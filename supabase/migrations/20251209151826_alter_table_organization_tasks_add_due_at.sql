-- =====================================================================
-- Migration: alter_table_organization_tasks_add_due_at
-- Objetivo:
--   - Adicionar coluna de prazo (due_at) na tabela public.organization_tasks
--   - Prazo representado como timestamp com time zone (timestamptz)
--     para indicar um instante exato no tempo.
--
-- Premissas:
--   - A tabela public.organization_tasks já foi criada
--   - Campos created_at/updated_at já usam timestamptz
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) Adicionar coluna due_at
--
-- Conceito:
--   - Representa o prazo da tarefa.
--   - Opcional: nem toda task precisa ter prazo definido.
--   - Tipo: timestamptz (timestamp with time zone)
--     - Armazena o instante em UTC.
--     - Facilita comparações com now() e ordenação por vencimento.
-- ---------------------------------------------------------------------
alter table public.organization_tasks
  add column due_at timestamptz null;

-- ---------------------------------------------------------------------
-- 2) (Opcional) Índice para consultas por prazo
--
-- Útil para:
--   - Listar tasks ordenadas por prazo
--   - Buscar tasks vencidas ou próximas do prazo
-- ---------------------------------------------------------------------
create index if not exists organization_tasks_due_at_idx
  on public.organization_tasks (due_at);

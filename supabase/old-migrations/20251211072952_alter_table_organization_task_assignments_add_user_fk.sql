-- =====================================================================
-- Migration: alter_table_organization_task_assignments_add_user_fk
-- Objetivo:
--   - Adicionar uma FK direta de organization_task_assignments.user_id → users.id
--   - Facilitar joins diretos com a tabela users
--   - Permitir que o Supabase gere o relacionamento para uso em selects do tipo:
--       user:users!organization_task_assignments_user_id_fkey (...)
--   - Manter as FKs existentes para organization_tasks e organization_memberships
-- =====================================================================

alter table public.organization_task_assignments
add constraint organization_task_assignments_user_fk
  foreign key (user_id)
  references public.users (id)
  on update cascade
  on delete restrict;

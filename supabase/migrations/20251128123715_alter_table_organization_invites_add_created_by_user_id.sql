-- =====================================================================
-- Migration: alter_table_organization_invites_add_created_by_user_id
-- Objetivo:
--   - Adicionar a coluna created_by_user_id à tabela public.organization_invites
--   - Armazenar quem "criou" o convite / é dono do link utilizado
--   - Relacionar created_by_user_id com public.users.id
--
-- Premissas:
--   - A tabela public.organization_invites já existe
--   - A tabela public.users já existe
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1) Adicionar coluna created_by_user_id
--
-- Conceito:
--   - Representa o usuário que originou o convite.
--   - No caso de link público com dono, é o "dono do link".
--   - Diferente de:
--       - requested_by_user_id: quem pediu para entrar
--       - handled_by_user_id  : quem aprovou/rejeitou o pedido
-- ---------------------------------------------------------------------
alter table public.organization_invites
  add column created_by_user_id uuid null;


-- ---------------------------------------------------------------------
-- 2) Adicionar constraint de foreign key
--
-- Regra:
--   - created_by_user_id referencia public.users(id)
--   - on delete set null: se o usuário for removido, não quebra o histórico,
--     apenas zera o campo.
-- ---------------------------------------------------------------------
alter table public.organization_invites
  add constraint organization_invites_created_by_user_id_fkey
    foreign key (created_by_user_id)
    references public.users (id)
    on delete set null;


-- ---------------------------------------------------------------------
-- 3) Comentários de documentação
-- ---------------------------------------------------------------------
comment on column public.organization_invites.created_by_user_id is
  'Usuário que originou o convite/pedido (ex.: dono do link público utilizado).';


-- ---------------------------------------------------------------------
-- 4) Índice opcional em created_by_user_id
--
-- Objetivo:
--   - Facilitar consultas por "quem convidou quem"
--   - Ex.: listar todos os convites originados por um determinado usuário.
-- ---------------------------------------------------------------------
create index if not exists organization_invites_created_by_user_id_idx
  on public.organization_invites using btree (created_by_user_id)
  tablespace pg_default;

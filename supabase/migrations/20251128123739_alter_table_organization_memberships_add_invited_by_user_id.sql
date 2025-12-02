-- =====================================================================
-- Migration: alter_table_organization_memberships_add_invited_by_user_id
-- Objetivo:
--   - Adicionar a coluna invited_by_user_id à tabela public.organization_memberships
--   - Armazenar quem efetivamente convidou/adicionou o membro à organização
--   - Relacionar invited_by_user_id com public.users.id
--
-- Premissas:
--   - A tabela public.organization_memberships já existe
--   - A tabela public.users já existe
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1) Adicionar coluna invited_by_user_id
--
-- Conceito:
--   - Representa quem trouxe o usuário para a organização.
--   - No seu fluxo:
--       - normalmente será igual ao created_by_user_id do invite
--         (dono do link público utilizado).
--   - Diferente de handled_by_user_id (que fica em organization_invites),
--     que representa quem aprovou o pedido.
-- ---------------------------------------------------------------------
alter table public.organization_memberships
  add column invited_by_user_id uuid null;


-- ---------------------------------------------------------------------
-- 2) Adicionar constraint de foreign key
--
-- Regra:
--   - invited_by_user_id referencia public.users(id)
--   - on delete set null: se o usuário "convidador" for removido, não quebrar
--     o vínculo, apenas remover a referência.
-- ---------------------------------------------------------------------
alter table public.organization_memberships
  add constraint organization_memberships_invited_by_user_id_fkey
    foreign key (invited_by_user_id)
    references public.users (id)
    on delete set null;


-- ---------------------------------------------------------------------
-- 3) Comentários de documentação
-- ---------------------------------------------------------------------
comment on column public.organization_memberships.invited_by_user_id is
  'Usuário que convidou/adicionou este membro à organização (normalmente o dono do link público utilizado).';


-- ---------------------------------------------------------------------
-- 4) Índice opcional em invited_by_user_id
--
-- Objetivo:
--   - Facilitar consultas por "quem este usuário convidou"
--   - Ex.: listar todos os membros trazidos por um determinado usuário
-- ---------------------------------------------------------------------
create index if not exists organization_memberships_invited_by_user_id_idx
  on public.organization_memberships using btree (invited_by_user_id)
  tablespace pg_default;

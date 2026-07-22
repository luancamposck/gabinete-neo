-- =====================================================================
-- Migration: alter_table_users_replace_invite_code_with_username
-- Objetivo:
--   - Substituir o mecanismo de indicação (invite_code) por um username/nickname
--   - Adicionar public.users.username (text) NOT NULL e UNIQUE
--   - Preencher registros existentes com um valor "nickname-<sufixo>"
--   - Remover a coluna public.users.invite_code
--
-- Premissas:
--   - A tabela public.users já existe
--   - invite_code era usado como identificador curto de referral
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1) Adicionar coluna username (temporariamente NULL)
-- ---------------------------------------------------------------------
alter table public.users
  add column username text null;


-- ---------------------------------------------------------------------
-- 2) Preencher username nos registros existentes
--
-- Nota:
--   - username precisa ser UNIQUE, então não dá pra setar todo mundo como "nickname".
--   - Aqui usamos "nickname-" + 8 chars do uuid (sem hífens) pra garantir unicidade.
-- ---------------------------------------------------------------------
update public.users
set username = 'nickname-' || left(replace(id::text, '-', ''), 8)
where username is null;


-- ---------------------------------------------------------------------
-- 3) Tornar username obrigatório
-- ---------------------------------------------------------------------
alter table public.users
  alter column username set not null;


-- ---------------------------------------------------------------------
-- 4) Garantir unicidade
-- ---------------------------------------------------------------------
alter table public.users
  add constraint users_username_key unique (username);


-- ---------------------------------------------------------------------
-- 5) Remover a coluna antiga usada no referral (invite_code)
-- ---------------------------------------------------------------------
alter table public.users
  drop column if exists invite_code;

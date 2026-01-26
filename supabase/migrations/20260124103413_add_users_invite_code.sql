-- =====================================================================
-- Migration: add_users_invite_code
-- Objetivo:
--   - Adicionar coluna public.users.invite_code para links curtos de convite
--   - Gerar automaticamente um código aleatório (URL-safe)
--   - Garantir unicidade via índice unique (case-insensitive)
--
-- Premissas:
--   - A tabela public.users já existe
--   - A extensão pgcrypto está disponível (Supabase normalmente tem)
-- =====================================================================

-- ---------------------------------------------------------------------
-- 0) Extensão: pgcrypto (para gen_random_bytes)
-- ---------------------------------------------------------------------
create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- 1) Função: public.generate_invite_code
-- ---------------------------------------------------------------------
create or replace function public.generate_invite_code(len int default 10)
returns text
language plpgsql
as $$
declare
  chars text := '0123456789abcdefghijklmnopqrstuvwxyz';
  out text := '';
  b bytea;
  i int;
  idx int;
begin
  b := extensions.gen_random_bytes(len);

  for i in 0..len-1 loop
    idx := (get_byte(b, i) % length(chars)) + 1;
    out := out || substr(chars, idx, 1);
  end loop;

  return out;
end;
$$;

-- ---------------------------------------------------------------------
-- 2) Coluna: invite_code
-- ---------------------------------------------------------------------
alter table public.users
  add column invite_code text null;

-- ---------------------------------------------------------------------
-- 3) Preencher para registros existentes (tabela vazia? mesmo assim ok)
-- ---------------------------------------------------------------------
update public.users
set invite_code = public.generate_invite_code(10)
where invite_code is null;

-- ---------------------------------------------------------------------
-- 4) Tornar NOT NULL
-- ---------------------------------------------------------------------
alter table public.users
  alter column invite_code set not null;

-- ---------------------------------------------------------------------
-- 5) Unique case-insensitive
-- ---------------------------------------------------------------------
create unique index users_invite_code_unique_idx
  on public.users (lower(invite_code));

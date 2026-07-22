-- =====================================================================
-- Migration: create_users
-- Objetivo:
--   - Criar a tabela pública de usuários da aplicação.
--
-- Premissas:
--   - auth.users é gerenciada pelo Supabase Auth.
--   - public.handle_updated_at() já existe.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1) Table: public.users
-- ---------------------------------------------------------------------
create table public.users (
  -- ID do usuário, espelhando auth.users.id
  id uuid not null,

  -- Email usado no cadastro/autenticação
  email text not null,

  -- Nome público exibido na aplicação
  name text not null,

  -- Identificador público normalizado para referrals
  username text not null,

  -- Data/hora de criação do registro
  created_at timestamptz not null default now(),

  -- Data/hora da última atualização do registro
  updated_at timestamptz not null default now(),

  -- Garante que cada usuário público tenha um único registro
  constraint users_pkey primary key (id),

  -- Evita duplicidade de email na tabela pública
  constraint users_email_key unique (email),

  -- Evita duplicidade de username usado em referrals e links públicos
  constraint users_username_key unique (username),

  -- Mantém no banco o mesmo formato aceito pela validação server-side
  constraint users_username_format_check
    check (username ~ '^[a-z0-9_]{3,20}$'),

  -- Mantém public.users sincronizada com a identidade do Supabase Auth
  constraint users_id_fkey
    foreign key (id)
    references auth.users (id)
    on update cascade
    on delete cascade
) tablespace pg_default;

comment on table public.users is
  'Usuários públicos da aplicação, vinculados 1:1 com auth.users.';

comment on column public.users.id is
  'Mesma UUID de auth.users.id.';

comment on column public.users.email is
  'Email do usuário.';

comment on column public.users.name is
  'Nome público do usuário.';

comment on column public.users.username is
  'Username normalizado para referrals e identificação pública.';

comment on column public.users.created_at is
  'Timestamp de criação do registro.';

comment on column public.users.updated_at is
  'Timestamp atualizado automaticamente em UPDATE.';


-- ---------------------------------------------------------------------
-- 2) Trigger: updated_at
-- ---------------------------------------------------------------------
create trigger on_users_updated
before update on public.users
for each row
execute function public.handle_updated_at();

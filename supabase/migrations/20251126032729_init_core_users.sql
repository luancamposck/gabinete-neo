-- =====================================================================
-- Migration: init_core_users
-- Objetivo:
--   - Criar função genérica para atualizar updated_at automaticamente
--   - Criar a tabela public.users, vinculada a auth.users
--   - Criar trigger para manter updated_at em updates
--
-- Premissas:
--   - Projeto Supabase recém-criado (sem schema de domínio ainda)
--   - Tabela auth.users já existe (gerenciada pelo Supabase Auth)
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1) Função utilitária: handle_updated_at()
--
-- Padrão:
--   - Toda tabela que tiver coluna updated_at TIMESTAMPTZ
--     pode usar essa função em um trigger BEFORE UPDATE.
--
-- Comportamento:
--   - Sempre que um registro for atualizado, updated_at recebe now().
-- ---------------------------------------------------------------------
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  -- Atualiza a coluna updated_at para o timestamp atual
  new.updated_at = now();
  return new;
end;
$$;

comment on function public.handle_updated_at() is
  'Trigger genérica para atualizar automaticamente a coluna updated_at em operações de UPDATE.';


-- ---------------------------------------------------------------------
-- 2) Tabela public.users
--
-- Objetivo:
--   - Tabela de perfil / metadados de usuário da aplicação.
--   - Mantém relação 1-para-1 com auth.users (mesmo id).
--
-- Notas importantes:
--   - A coluna id é foreign key para auth.users.id.
--   - ON DELETE CASCADE: se o usuário for apagado em auth.users,
--     o registro correspondente em public.users também é apagado.
--   - email é unique para garantir consistência.
-- ---------------------------------------------------------------------
create table public.users (
  -- ID do usuário (mesmo ID da tabela auth.users)
  id uuid not null,

  -- Email do usuário. Idealmente deve ser igual ao email em auth.users
  email text not null,

  -- Data/hora de criação do registro
  created_at timestamp with time zone not null default now(),

  -- Data/hora da última atualização do registro
  updated_at timestamp with time zone not null default now(),

  -- Nome completo ou nome público do usuário
  name text not null,

  -- Chave primária na coluna id
  constraint users_pkey primary key (id),

  -- Garante que não haverá dois usuários com o mesmo email
  constraint users_email_key unique (email),

  -- Relaciona o id com auth.users.id
  constraint users_id_fkey
    foreign key (id)
    references auth.users (id)
    on delete cascade
) tablespace pg_default;

comment on table public.users is
  'Tabela de perfis de usuários da aplicação, vinculada 1:1 com auth.users.';

comment on column public.users.id is
  'Mesma UUID da tabela auth.users, usada como chave primária e foreign key.';

comment on column public.users.email is
  'Email do usuário, geralmente refletindo o email de auth.users.';

comment on column public.users.created_at is
  'Timestamp de criação do registro. Definido automaticamente como now().';

comment on column public.users.updated_at is
  'Timestamp da última atualização do registro. Atualizado via trigger.';

comment on column public.users.name is
  'Nome completo ou nome público do usuário.';


-- ---------------------------------------------------------------------
-- 3) Trigger: on_users_updated
--
-- Objetivo:
--   - Atualizar automaticamente updated_at em toda operação de UPDATE.
--
-- Observação:
--   - Usa a função genérica public.handle_updated_at() definida acima.
-- ---------------------------------------------------------------------
create trigger on_users_updated
before update on public.users
for each row
execute function public.handle_updated_at();

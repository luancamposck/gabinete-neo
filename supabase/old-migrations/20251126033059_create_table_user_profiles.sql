-- =====================================================================
-- Migration: create_table_user_profiles
-- Objetivo:
--   - Criar a tabela public.user_profiles com dados de perfil/endereço
--   - Relacionar 1:1 com public.users (via user_id)
--   - Garantir unicidade de CPF
--   - Adicionar trigger para manter updated_at atualizado
--
-- Premissas:
--   - A função public.handle_updated_at() já existe
--   - A tabela public.users já foi criada em migration anterior
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) Tabela public.user_profiles
--
-- Objetivo:
--   - Guardar dados pessoais e de endereço do usuário.
--   - Relacionamento 1:1 com public.users:
--       - user_id é PRIMARY KEY
--       - user_id é também FOREIGN KEY para users(id)
--
-- Notas:
--   - CPF é armazenado como character(11) (apenas dígitos, sem pontuação).
--   - CEP é armazenado como character(8) (apenas dígitos, sem hífen).
--   - state é armazenado como character(2) (sigla UF, ex: 'RO', 'SP').
-- ---------------------------------------------------------------------
create table public.user_profiles (
  -- Chave primária e referência ao usuário (1:1 com public.users)
  user_id uuid not null,

  -- CPF do usuário, somente dígitos (11 caracteres)
  cpf character(11) not null,

  -- Telefone de contato, APENAS dígitos, com 10 ou 11 caracteres
  -- Ex.: 10 dígitos: DDD + número fixo
  --      11 dígitos: DDD + número celular
  phone character varying(11) not null,

  -- CEP somente dígitos (8 caracteres)
  cep character(8) not null,

  -- Logradouro (rua / avenida / etc.)
  street text not null,

  -- Número do endereço (pode ser texto para suportar, por exemplo, 'S/N')
  number text not null,

  -- Complemento (opcional: bloco, apartamento, etc.)
  complement text null,

  -- Bairro
  neighborhood text not null,

  -- Cidade
  city text not null,

  -- Estado (UF, ex: 'RO', 'SP') com 2 caracteres
  state character(2) not null,

  -- Data/hora de criação do registro
  created_at timestamp with time zone not null default now(),

  -- Data/hora da última atualização do registro
  updated_at timestamp with time zone not null default now(),

  -- Primary key na própria coluna user_id
  constraint user_profiles_pkey primary key (user_id),

  -- Garante que não existam dois perfis com o mesmo CPF
  constraint user_profiles_cpf_key unique (cpf),

  -- Relaciona user_id com public.users.id (1:1)
  constraint user_profiles_user_id_fkey
    foreign key (user_id)
    references public.users (id)
    on delete cascade
) tablespace pg_default;


comment on table public.user_profiles is
  'Tabela de dados pessoais e endereço do usuário, relacionada 1:1 com public.users.';

comment on column public.user_profiles.user_id is
  'Chave primária e foreign key para public.users.id, representando o dono do perfil.';

comment on column public.user_profiles.cpf is
  'CPF do usuário, armazenado como 11 caracteres numéricos, sem pontos ou traço.';

comment on column public.user_profiles.phone is
  'Telefone de contato do usuário em formato livre.';

comment on column public.user_profiles.cep is
  'CEP do endereço do usuário, 8 dígitos numéricos, sem hífen.';

comment on column public.user_profiles.street is
  'Logradouro (rua, avenida, etc.) do endereço do usuário.';

comment on column public.user_profiles.number is
  'Número do endereço (pode conter texto, ex: "S/N").';

comment on column public.user_profiles.complement is
  'Complemento do endereço (apto, bloco, etc.), opcional.';

comment on column public.user_profiles.neighborhood is
  'Bairro do endereço do usuário.';

comment on column public.user_profiles.city is
  'Cidade do endereço do usuário.';

comment on column public.user_profiles.state is
  'Unidade Federativa (UF) do endereço, como "RO", "SP", etc.';

comment on column public.user_profiles.created_at is
  'Timestamp de criação do registro. Definido automaticamente como now().';

comment on column public.user_profiles.updated_at is
  'Timestamp da última atualização do registro. Atualizado via trigger.';


-- ---------------------------------------------------------------------
-- 2) Índice em cpf (opcional – ver explicação abaixo)
--
-- IMPORTANTE:
--   O unique constraint user_profiles_cpf_key JÁ cria um índice único
--   internamente em cpf.
--
--   Portanto, este índice separado é redundante na prática.
--   Deixo aqui apenas como exemplo, mas você pode remover se quiser
--   evitar índices duplicados.
-- ---------------------------------------------------------------------
-- create index if not exists user_profiles_cpf_idx
--   on public.user_profiles using btree (cpf)
--   tablespace pg_default;


-- ---------------------------------------------------------------------
-- 3) Trigger: on_user_profiles_updated
--
-- Objetivo:
--   - Atualizar automaticamente updated_at em toda operação de UPDATE.
--
-- Observação:
--   - Usa a função genérica public.handle_updated_at() definida anteriormente.
--   - Padrão de nome de trigger: on_<table>_updated
-- ---------------------------------------------------------------------
create trigger on_user_profiles_updated
before update on public.user_profiles
for each row
execute function public.handle_updated_at();

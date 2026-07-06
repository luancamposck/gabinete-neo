-- =====================================================================
-- Migration: create_users_profiles
-- Objetivo:
--   - Criar a tabela de perfil e endereço dos usuários.
--
-- Premissas:
--   - public.users já existe.
--   - public.handle_updated_at() já existe.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1) Table: public.user_profiles
-- ---------------------------------------------------------------------
create table public.user_profiles (
  -- ID do usuário dono do perfil, em relação 1:1 com public.users
  user_id uuid not null,

  -- Telefone do usuário, somente dígitos com DDD
  phone text not null,

  -- CEP do endereço, somente dígitos
  cep text not null,

  -- Logradouro do endereço
  street text not null,

  -- Número do endereço, aceitando textos como S/N
  number text not null,

  -- Complemento opcional do endereço
  complement text null,

  -- Bairro do endereço
  neighborhood text not null,

  -- Cidade do endereço
  city text not null,

  -- Unidade federativa brasileira
  state text not null,

  -- Data/hora de criação do registro
  created_at timestamptz not null default now(),

  -- Data/hora da última atualização do registro
  updated_at timestamptz not null default now(),

  -- Garante relação 1:1 entre usuário e perfil
  constraint user_profiles_pkey primary key (user_id),

  -- Evita reutilização do mesmo telefone em perfis diferentes
  constraint user_profiles_phone_key unique (phone),

  -- Mantém telefone no formato persistido pela validação server-side
  constraint user_profiles_phone_check
    check (phone ~ '^[0-9]{10,11}$'),

  -- Mantém CEP no formato persistido pela validação server-side
  constraint user_profiles_cep_check
    check (cep ~ '^[0-9]{8}$'),

  -- Restringe UF aos códigos brasileiros válidos
  constraint user_profiles_state_check
    check (state in (
      'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
      'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
      'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
    )),

  -- Mantém o perfil sincronizado com o usuário público
  constraint user_profiles_user_id_fkey
    foreign key (user_id)
    references public.users (id)
    on update cascade
    on delete cascade
) tablespace pg_default;

comment on table public.user_profiles is
  'Perfis e endereços dos usuários, relacionados 1:1 com public.users.';

comment on column public.user_profiles.user_id is
  'Chave primária e foreign key para public.users.id.';

comment on column public.user_profiles.phone is
  'Telefone do usuário, armazenado apenas com dígitos.';

comment on column public.user_profiles.cep is
  'CEP do endereço, armazenado apenas com 8 dígitos.';

comment on column public.user_profiles.street is
  'Logradouro do endereço.';

comment on column public.user_profiles.number is
  'Número do endereço.';

comment on column public.user_profiles.complement is
  'Complemento opcional do endereço.';

comment on column public.user_profiles.neighborhood is
  'Bairro do endereço.';

comment on column public.user_profiles.city is
  'Cidade do endereço.';

comment on column public.user_profiles.state is
  'Unidade federativa brasileira do endereço.';

comment on column public.user_profiles.created_at is
  'Timestamp de criação do registro.';

comment on column public.user_profiles.updated_at is
  'Timestamp atualizado automaticamente em UPDATE.';


-- ---------------------------------------------------------------------
-- 2) Trigger: updated_at
-- ---------------------------------------------------------------------
create trigger on_user_profiles_updated
before update on public.user_profiles
for each row
execute function public.handle_updated_at();

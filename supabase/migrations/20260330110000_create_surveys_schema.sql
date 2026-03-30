-- =====================================================================
-- Migration: create_surveys_schema
-- Objetivo:
--   - Criar estrutura de pesquisas (surveys), perguntas, opções e respostas
--   - Suportar respostas anônimas e públicas
--   - Otimizar listagens por dashboard/público
--   - Impedir duplicidade de resposta por usuário/fingerprint
-- =====================================================================

-- ---------------------------------------------------------------------
-- 0) Enums
-- ---------------------------------------------------------------------
create type public.survey_visibility as enum ('public', 'private');

create type public.survey_status as enum ('draft', 'published', 'closed');

create type public.survey_question_type as enum (
  'single_choice',
  'textarea',
  'checkbox',
  'ranking'
);

-- ---------------------------------------------------------------------
-- 1) Tabela public.surveys
-- ---------------------------------------------------------------------
create table public.surveys (
  id uuid not null default gen_random_uuid(),
  organization_id uuid not null,
  created_by_user_id uuid not null,

  title text not null,
  description text null,

  visibility public.survey_visibility not null default 'private',
  accept_anonymous_answers boolean not null default false,
  status public.survey_status not null default 'draft',

  starts_at timestamptz null,
  ends_at timestamptz null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint surveys_pkey primary key (id),
  constraint surveys_organization_id_fkey
    foreign key (organization_id)
    references public.organizations (id)
    on update cascade
    on delete cascade,
  constraint surveys_created_by_user_id_fkey
    foreign key (created_by_user_id)
    references public.users (id)
    on update cascade
    on delete restrict,
  constraint surveys_starts_at_before_ends_at_check
    check (starts_at is null or ends_at is null or starts_at <= ends_at)
);

create trigger on_surveys_updated
before update on public.surveys
for each row
execute function public.handle_updated_at();

-- ---------------------------------------------------------------------
-- 2) Tabela public.survey_questions
-- ---------------------------------------------------------------------
create table public.survey_questions (
  id uuid not null default gen_random_uuid(),
  survey_id uuid not null,
  position integer not null,

  type public.survey_question_type not null,
  title text not null,
  description text null,
  required boolean not null default false,

  config_json jsonb not null default '{}'::jsonb,

  constraint survey_questions_pkey primary key (id),
  constraint survey_questions_survey_id_fkey
    foreign key (survey_id)
    references public.surveys (id)
    on update cascade
    on delete cascade,
  constraint survey_questions_position_positive_check
    check (position > 0),
  constraint survey_questions_unique_position_per_survey
    unique (survey_id, position)
);

-- ---------------------------------------------------------------------
-- 3) Tabela public.survey_question_options
-- ---------------------------------------------------------------------
create table public.survey_question_options (
  id uuid not null default gen_random_uuid(),
  question_id uuid not null,
  position integer not null,
  label text not null,
  value text not null,

  constraint survey_question_options_pkey primary key (id),
  constraint survey_question_options_question_id_fkey
    foreign key (question_id)
    references public.survey_questions (id)
    on update cascade
    on delete cascade,
  constraint survey_question_options_position_positive_check
    check (position > 0),
  constraint survey_question_options_unique_position_per_question
    unique (question_id, position),
  constraint survey_question_options_unique_value_per_question
    unique (question_id, value)
);

-- ---------------------------------------------------------------------
-- 4) Tabela public.survey_responses
-- ---------------------------------------------------------------------
create table public.survey_responses (
  id uuid not null default gen_random_uuid(),
  survey_id uuid not null,

  organization_id uuid null,
  respondent_user_id uuid null,

  is_anonymous boolean not null default false,
  responder_fingerprint_hash text null,

  submitted_at timestamptz not null default now(),

  constraint survey_responses_pkey primary key (id),
  constraint survey_responses_survey_id_fkey
    foreign key (survey_id)
    references public.surveys (id)
    on update cascade
    on delete cascade,
  constraint survey_responses_organization_id_fkey
    foreign key (organization_id)
    references public.organizations (id)
    on update cascade
    on delete set null,
  constraint survey_responses_respondent_user_id_fkey
    foreign key (respondent_user_id)
    references public.users (id)
    on update cascade
    on delete set null
);

-- ---------------------------------------------------------------------
-- 5) Tabela public.survey_response_items
-- ---------------------------------------------------------------------
create table public.survey_response_items (
  id uuid not null default gen_random_uuid(),
  response_id uuid not null,
  question_id uuid not null,

  answer_text text null,
  answer_option_ids_json jsonb null,
  answer_ranking_json jsonb null,

  constraint survey_response_items_pkey primary key (id),
  constraint survey_response_items_response_id_fkey
    foreign key (response_id)
    references public.survey_responses (id)
    on update cascade
    on delete cascade,
  constraint survey_response_items_question_id_fkey
    foreign key (question_id)
    references public.survey_questions (id)
    on update cascade
    on delete cascade,
  constraint survey_response_items_unique_question_per_response
    unique (response_id, question_id)
);

-- ---------------------------------------------------------------------
-- 6) Índices requisitados
-- ---------------------------------------------------------------------

-- Listagem em dashboard
create index surveys_dashboard_listing_idx
  on public.surveys (organization_id, visibility, status, created_at);

-- Listagem pública
create index surveys_public_listing_idx
  on public.surveys (visibility, status, starts_at, ends_at);

-- Resposta única por pesquisa + usuário (somente quando usuário existe)
create unique index survey_responses_unique_survey_user_idx
  on public.survey_responses (survey_id, respondent_user_id)
  where respondent_user_id is not null;

-- Resposta única por pesquisa + fingerprint (somente quando hash existe)
create unique index survey_responses_unique_survey_fingerprint_idx
  on public.survey_responses (survey_id, responder_fingerprint_hash)
  where responder_fingerprint_hash is not null;

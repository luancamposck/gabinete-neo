-- =====================================================================
-- Migration: revert_surveys_module
-- Objetivo:
--   - Reverter todas as migrations de surveys adicionadas após o commit
--     d7f1b42936687f2645847ebae1b3ea7975d29748
--   - Remover schema, RLS, views, triggers, RPCs e permission key
--     do módulo de surveys
-- =====================================================================

-- ---------------------------------------------------------------------
-- 0) Views dependentes
-- ---------------------------------------------------------------------
drop view if exists public.survey_response_items_safe;
drop view if exists public.survey_responses_safe;

-- ---------------------------------------------------------------------
-- 1) Policies de RLS do módulo
-- ---------------------------------------------------------------------
do $$
begin
  if to_regclass('public.survey_question_options') is not null then
    execute 'drop policy if exists "Readable options follow readable questions" on public.survey_question_options';
    execute 'drop policy if exists "Survey managers can insert question options" on public.survey_question_options';
    execute 'drop policy if exists "Survey managers can update question options" on public.survey_question_options';
    execute 'drop policy if exists "Survey managers can delete question options" on public.survey_question_options';
  end if;

  if to_regclass('public.survey_questions') is not null then
    execute 'drop policy if exists "Readable questions follow readable surveys" on public.survey_questions';
    execute 'drop policy if exists "Survey managers can insert questions" on public.survey_questions';
    execute 'drop policy if exists "Survey managers can update questions" on public.survey_questions';
    execute 'drop policy if exists "Survey managers can delete questions" on public.survey_questions';
  end if;

  if to_regclass('public.survey_response_items') is not null then
    execute 'drop policy if exists "Allowed survey response item inserts" on public.survey_response_items';
  end if;

  if to_regclass('public.survey_responses') is not null then
    execute 'drop policy if exists "Allowed survey response inserts" on public.survey_responses';
  end if;

  if to_regclass('public.surveys') is not null then
    execute 'drop policy if exists "Public and member survey reads" on public.surveys';
    execute 'drop policy if exists "Survey managers can insert surveys" on public.surveys';
    execute 'drop policy if exists "Survey managers can update surveys" on public.surveys';
  end if;
end
$$;

-- ---------------------------------------------------------------------
-- 2) Triggers específicos do módulo
-- ---------------------------------------------------------------------
do $$
begin
  if to_regclass('public.survey_response_items') is not null then
    execute 'drop trigger if exists trg_enforce_survey_response_item_survey_integrity on public.survey_response_items';
  end if;

  if to_regclass('public.survey_responses') is not null then
    execute 'drop trigger if exists trg_enforce_survey_response_anonymity on public.survey_responses';
  end if;
end
$$;

-- ---------------------------------------------------------------------
-- 3) RPCs e helpers SQL do módulo
-- ---------------------------------------------------------------------
drop function if exists public.submit_survey_response(
  uuid,
  uuid,
  uuid,
  uuid,
  text,
  text,
  text,
  boolean,
  text,
  timestamptz,
  jsonb
);

drop function if exists public.create_survey_with_questions(
  uuid,
  uuid,
  text,
  text,
  public.survey_visibility,
  boolean,
  timestamptz,
  timestamptz,
  jsonb
);

drop function if exists public.enforce_survey_response_item_survey_integrity();
drop function if exists public.enforce_survey_response_anonymity();
drop function if exists public.can_insert_survey_response_item(uuid, uuid, uuid);
drop function if exists public.can_submit_survey_response(uuid, uuid);
drop function if exists public.can_manage_survey_question(uuid, uuid);
drop function if exists public.can_manage_survey(uuid, uuid);
drop function if exists public.can_manage_surveys(uuid, uuid);
drop function if exists public.is_active_organization_member(uuid, uuid);

-- ---------------------------------------------------------------------
-- 4) Tabelas do módulo
-- ---------------------------------------------------------------------
drop table if exists public.survey_response_items;
drop table if exists public.survey_responses;
drop table if exists public.survey_question_options;
drop table if exists public.survey_questions;
drop table if exists public.surveys;

-- ---------------------------------------------------------------------
-- 5) Enums do módulo
-- ---------------------------------------------------------------------
drop type if exists public.survey_question_type;
drop type if exists public.survey_status;
drop type if exists public.survey_visibility;

-- ---------------------------------------------------------------------
-- 6) Permission key dedicada ao módulo
-- ---------------------------------------------------------------------
delete from public.permissions
where key = 'surveys.manage';

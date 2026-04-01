-- =====================================================================
-- Migration: update_survey_safe_response_views
-- Objetivo:
--   - Atualizar as safe views de respostas com os novos campos manuais
--   - Garantir que respostas anônimas nunca exponham identidade
--   - Permitir projeção segura de respondentes públicos identificados
-- =====================================================================

create or replace view public.survey_responses_safe as
select
  sr.id,
  sr.survey_id,
  sr.organization_id,
  sr.submitted_at,
  sr.is_anonymous,
  case
    when sr.is_anonymous then null
    else sr.respondent_user_id
  end as respondent_user_id,
  case
    when sr.is_anonymous then null
    else sr.respondent_name
  end as respondent_name,
  case
    when sr.is_anonymous then null
    else sr.respondent_email
  end as respondent_email,
  case
    when sr.is_anonymous then null
    else sr.respondent_phone
  end as respondent_phone,
  sr.responder_fingerprint_hash
from public.survey_responses sr;

create or replace view public.survey_response_items_safe as
select
  sri.id,
  sri.response_id,
  sri.question_id,
  sri.answer_text,
  sri.answer_option_ids_json,
  sri.answer_ranking_json,
  srs.survey_id,
  srs.organization_id,
  srs.submitted_at,
  srs.is_anonymous,
  srs.respondent_user_id,
  srs.respondent_name,
  srs.respondent_email,
  srs.respondent_phone
from public.survey_response_items sri
inner join public.survey_responses_safe srs
  on srs.id = sri.response_id;

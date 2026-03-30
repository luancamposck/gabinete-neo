-- =====================================================================
-- Migration: enforce_survey_response_anonymity
-- Objetivo:
--   - Garantir regras de anonimato no momento de persistência
--   - Impedir respostas anônimas quando a survey não permite
--   - Exigir vínculo de usuário em respostas identificadas
--   - Publicar visões seguras para analytics/export sem reexposição de identidade
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) Trigger de validação/sanitização da resposta
-- ---------------------------------------------------------------------
create or replace function public.enforce_survey_response_anonymity()
returns trigger
language plpgsql
as $$
declare
  v_accept_anonymous_answers boolean;
begin
  select s.accept_anonymous_answers
    into v_accept_anonymous_answers
  from public.surveys s
  where s.id = new.survey_id;

  -- Se a survey não existe, deixar o FK tratar o erro padrão.
  if v_accept_anonymous_answers is null then
    return new;
  end if;

  -- Quando a survey não aceita anonimato:
  --  - não pode marcar is_anonymous
  --  - precisa ter vínculo explícito com usuário
  if v_accept_anonymous_answers = false then
    if new.is_anonymous = true then
      raise exception using
        errcode = '23514',
        message = 'Anonymous responses are disabled for this survey.';
    end if;

    if new.respondent_user_id is null then
      raise exception using
        errcode = '23514',
        message = 'Identified responses require respondent_user_id.';
    end if;
  end if;

  -- Quando a resposta é anônima, nunca persistir vínculo do usuário,
  -- mesmo que venha autenticado na camada de aplicação.
  if new.is_anonymous = true then
    new.respondent_user_id = null;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_enforce_survey_response_anonymity on public.survey_responses;

create trigger trg_enforce_survey_response_anonymity
before insert or update on public.survey_responses
for each row
execute function public.enforce_survey_response_anonymity();

-- ---------------------------------------------------------------------
-- 2) Visão segura para analytics/export
-- ---------------------------------------------------------------------
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
  srs.respondent_user_id
from public.survey_response_items sri
inner join public.survey_responses_safe srs
  on srs.id = sri.response_id;

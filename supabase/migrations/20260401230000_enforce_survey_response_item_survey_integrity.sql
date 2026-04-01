-- =====================================================================
-- Migration: enforce_survey_response_item_survey_integrity
-- Objetivo:
--   - Impedir que itens de resposta apontem para perguntas de outra survey
--   - Rejeitar payloads adulterados antes do commit dos dados
-- =====================================================================

create or replace function public.enforce_survey_response_item_survey_integrity()
returns trigger
language plpgsql
as $$
declare
  v_response_survey_id uuid;
  v_question_survey_id uuid;
begin
  select sr.survey_id
    into v_response_survey_id
  from public.survey_responses sr
  where sr.id = new.response_id;

  select sq.survey_id
    into v_question_survey_id
  from public.survey_questions sq
  where sq.id = new.question_id;

  -- Se a resposta ou a pergunta não existir, deixar os FKs tratarem o erro padrão.
  if v_response_survey_id is null or v_question_survey_id is null then
    return new;
  end if;

  if v_response_survey_id <> v_question_survey_id then
    raise exception using
      errcode = '23514',
      message = 'Survey response items must reference questions from the same survey as the parent response.';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_enforce_survey_response_item_survey_integrity on public.survey_response_items;

create trigger trg_enforce_survey_response_item_survey_integrity
before insert or update on public.survey_response_items
for each row
execute function public.enforce_survey_response_item_survey_integrity();

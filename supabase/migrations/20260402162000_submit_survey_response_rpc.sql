-- =====================================================================
-- Migration: submit_survey_response_rpc
-- Objetivo:
--   - Persistir survey_responses e survey_response_items em uma única
--     operação atômica
--   - Preservar as regras de dedupe por usuário autenticado ou fingerprint
--   - Manter snapshot manual apenas para respostas públicas identificadas
-- =====================================================================

create or replace function public.submit_survey_response(
  p_response_id uuid,
  p_survey_id uuid,
  p_organization_id uuid default null,
  p_respondent_user_id uuid default null,
  p_respondent_name text default null,
  p_respondent_email text default null,
  p_respondent_phone text default null,
  p_is_anonymous boolean default false,
  p_responder_fingerprint_hash text default null,
  p_submitted_at timestamptz default now(),
  p_answers jsonb default '[]'::jsonb
) returns public.survey_responses
language plpgsql
set search_path = public
as $$
declare
  v_response public.survey_responses%rowtype;
  v_answer jsonb;
begin
  if p_answers is null then
    p_answers := '[]'::jsonb;
  end if;

  if jsonb_typeof(p_answers) <> 'array' then
    raise exception 'Answers payload must be a JSON array.'
      using errcode = '22023';
  end if;

  insert into public.survey_responses (
    id,
    survey_id,
    organization_id,
    respondent_user_id,
    respondent_name,
    respondent_email,
    respondent_phone,
    is_anonymous,
    responder_fingerprint_hash,
    submitted_at
  )
  values (
    p_response_id,
    p_survey_id,
    p_organization_id,
    p_respondent_user_id,
    p_respondent_name,
    p_respondent_email,
    p_respondent_phone,
    p_is_anonymous,
    p_responder_fingerprint_hash,
    p_submitted_at
  )
  returning * into v_response;

  for v_answer in
    select value
    from jsonb_array_elements(p_answers)
  loop
    insert into public.survey_response_items (
      response_id,
      question_id,
      answer_text,
      answer_option_ids_json,
      answer_ranking_json
    )
    values (
      v_response.id,
      (v_answer->>'questionId')::uuid,
      v_answer->>'answerText',
      case
        when jsonb_typeof(v_answer->'answerOptionIds') = 'array' then v_answer->'answerOptionIds'
        else null
      end,
      case
        when jsonb_typeof(v_answer->'answerRanking') = 'array' then v_answer->'answerRanking'
        else null
      end
    );
  end loop;

  return v_response;
end;
$$;

comment on function public.submit_survey_response(
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
) is 'Persiste a resposta da survey e seus itens em uma única transação, preservando dedupe por usuário ou fingerprint.';

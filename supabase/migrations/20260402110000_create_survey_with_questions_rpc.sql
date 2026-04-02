-- =====================================================================
-- Migration: create_survey_with_questions_rpc
-- Objetivo:
--   - Persistir survey, questões e opções em uma única operação atômica
--   - Normalizar posições de questões/opções como base-1 a partir da ordem
--     do payload recebido pela aplicação
-- =====================================================================

create or replace function public.create_survey_with_questions(
  p_organization_id uuid,
  p_created_by_user_id uuid,
  p_title text,
  p_description text default null,
  p_visibility public.survey_visibility default 'private',
  p_accept_anonymous_answers boolean default false,
  p_starts_at timestamptz default null,
  p_ends_at timestamptz default null,
  p_questions jsonb default '[]'::jsonb
) returns public.surveys
language plpgsql
set search_path = public
as $$
declare
  v_survey public.surveys%rowtype;
  v_question jsonb;
  v_option jsonb;
  v_question_id uuid;
  v_question_index integer := 0;
  v_option_index integer := 0;
begin
  if p_questions is null then
    p_questions := '[]'::jsonb;
  end if;

  if jsonb_typeof(p_questions) <> 'array' then
    raise exception 'Questions payload must be a JSON array.'
      using errcode = '22023';
  end if;

  insert into public.surveys (
    organization_id,
    created_by_user_id,
    title,
    description,
    visibility,
    accept_anonymous_answers,
    starts_at,
    ends_at,
    status
  )
  values (
    p_organization_id,
    p_created_by_user_id,
    p_title,
    p_description,
    p_visibility,
    p_accept_anonymous_answers,
    p_starts_at,
    p_ends_at,
    'draft'
  )
  returning * into v_survey;

  for v_question in
    select value
    from jsonb_array_elements(p_questions)
  loop
    v_question_index := v_question_index + 1;

    if jsonb_typeof(coalesce(v_question->'options', '[]'::jsonb)) <> 'array' then
      raise exception 'Question options payload must be a JSON array.'
        using errcode = '22023';
    end if;

    insert into public.survey_questions (
      survey_id,
      position,
      type,
      title,
      description,
      required,
      config_json
    )
    values (
      v_survey.id,
      v_question_index,
      (v_question->>'type')::public.survey_question_type,
      v_question->>'title',
      v_question->>'description',
      coalesce((v_question->>'required')::boolean, false),
      coalesce(v_question->'configJson', '{}'::jsonb)
    )
    returning id into v_question_id;

    v_option_index := 0;

    for v_option in
      select value
      from jsonb_array_elements(coalesce(v_question->'options', '[]'::jsonb))
    loop
      v_option_index := v_option_index + 1;

      insert into public.survey_question_options (
        question_id,
        position,
        label,
        value
      )
      values (
        v_question_id,
        v_option_index,
        v_option->>'label',
        v_option->>'value'
      );
    end loop;
  end loop;

  return v_survey;
end;
$$;

comment on function public.create_survey_with_questions(
  uuid,
  uuid,
  text,
  text,
  public.survey_visibility,
  boolean,
  timestamptz,
  timestamptz,
  jsonb
) is 'Cria survey, questões e opções em uma única transação, normalizando posições base-1 pela ordem do payload.';

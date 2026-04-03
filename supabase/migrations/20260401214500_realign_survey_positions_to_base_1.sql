-- =====================================================================
-- Migration: realign_survey_positions_to_base_1
-- Objetivo:
--   - Corrigir dados legados que foram persistidos em base 0
--   - Garantir contrato consistente de posições base 1 para perguntas/opções
-- =====================================================================

with ranked_questions as (
  select
    id,
    row_number() over (
      partition by survey_id
      order by position asc, id asc
    ) as normalized_position
  from public.survey_questions
)
update public.survey_questions as survey_questions
set position = ranked_questions.normalized_position
from ranked_questions
where survey_questions.id = ranked_questions.id
  and survey_questions.position is distinct from ranked_questions.normalized_position;

with ranked_options as (
  select
    id,
    row_number() over (
      partition by question_id
      order by position asc, id asc
    ) as normalized_position
  from public.survey_question_options
)
update public.survey_question_options as survey_question_options
set position = ranked_options.normalized_position
from ranked_options
where survey_question_options.id = ranked_options.id
  and survey_question_options.position is distinct from ranked_options.normalized_position;

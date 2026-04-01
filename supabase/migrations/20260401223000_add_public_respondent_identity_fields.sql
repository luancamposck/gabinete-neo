-- =====================================================================
-- Migration: add_public_respondent_identity_fields
-- Objetivo:
--   - Adicionar snapshot manual de identidade para respostas públicas
--   - Preservar anonimato limpando os campos manuais quando is_anonymous = true
--   - Permitir respostas identificadas com usuário autenticado ou identidade manual
-- =====================================================================

alter table public.survey_responses
  add column if not exists respondent_name text null,
  add column if not exists respondent_email text null,
  add column if not exists respondent_phone text null;

create or replace function public.enforce_survey_response_anonymity()
returns trigger
language plpgsql
as $$
declare
  v_accept_anonymous_answers boolean;
  v_has_manual_identity boolean;
begin
  select s.accept_anonymous_answers
    into v_accept_anonymous_answers
  from public.surveys s
  where s.id = new.survey_id;

  -- Se a survey não existe, deixar o FK tratar o erro padrão.
  if v_accept_anonymous_answers is null then
    return new;
  end if;

  v_has_manual_identity := (
    new.respondent_name is not null
    and new.respondent_email is not null
    and new.respondent_phone is not null
  );

  -- Quando a survey não aceita anonimato:
  --  - não pode marcar is_anonymous
  --  - precisa ter respondent_user_id ou identidade manual completa
  if v_accept_anonymous_answers = false then
    if new.is_anonymous = true then
      raise exception using
        errcode = '23514',
        message = 'Anonymous responses are disabled for this survey.';
    end if;

    if new.respondent_user_id is null and v_has_manual_identity = false then
      raise exception using
        errcode = '23514',
        message = 'Identified responses require respondent_user_id or manual respondent identity.';
    end if;
  end if;

  -- Quando a resposta é anônima, nunca persistir vínculo do usuário
  -- nem snapshot manual de identidade.
  if new.is_anonymous = true then
    new.respondent_user_id = null;
    new.respondent_name = null;
    new.respondent_email = null;
    new.respondent_phone = null;
  end if;

  return new;
end;
$$;

-- =====================================================================
-- Migration: enable_survey_response_write_rls
-- Objetivo:
--   - Ativar RLS de escrita em public.survey_responses e
--     public.survey_response_items
--   - Permitir inserts apenas para surveys publicadas e disponíveis
--   - Restringir respostas de surveys privadas a membros ativos
--   - Garantir consistência básica de survey/organization/response no insert
-- =====================================================================

-- ---------------------------------------------------------------------
-- 0) Helpers reutilizáveis para policies de escrita
-- ---------------------------------------------------------------------
create or replace function public.can_submit_survey_response(
  p_survey_id uuid,
  p_user_id uuid default auth.uid()
) returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.surveys s
    where s.id = p_survey_id
      and s.status = 'published'
      and (s.starts_at is null or s.starts_at <= now())
      and (s.ends_at is null or s.ends_at >= now())
      and (
        s.visibility = 'public'
        or (
          s.visibility = 'private'
          and public.is_active_organization_member(s.organization_id, p_user_id)
        )
      )
  );
$$;

comment on function public.can_submit_survey_response(uuid, uuid) is
  'Retorna true quando a survey está publicada/disponível e o usuário atual pode enviar uma resposta.';

create or replace function public.can_insert_survey_response_item(
  p_response_id uuid,
  p_question_id uuid,
  p_user_id uuid default auth.uid()
) returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.survey_responses sr
    join public.survey_questions sq
      on sq.id = p_question_id
     and sq.survey_id = sr.survey_id
    where sr.id = p_response_id
      and public.can_submit_survey_response(sr.survey_id, p_user_id)
      and (
        sr.respondent_user_id is null
        or sr.respondent_user_id = p_user_id
      )
  );
$$;

comment on function public.can_insert_survey_response_item(uuid, uuid, uuid) is
  'Retorna true quando o item pertence à mesma survey da resposta e o contexto atual pode concluir esse envio.';

-- ---------------------------------------------------------------------
-- 1) Ativar RLS nas tabelas de escrita do módulo
-- ---------------------------------------------------------------------
alter table public.survey_responses enable row level security;
alter table public.survey_response_items enable row level security;

-- ---------------------------------------------------------------------
-- 2) Recriar policy de insert para public.survey_responses
-- ---------------------------------------------------------------------
drop policy if exists "Allowed survey response inserts" on public.survey_responses;

create policy "Allowed survey response inserts"
on public.survey_responses
for insert
with check (
  public.can_submit_survey_response(survey_id)
  and (
    respondent_user_id is null
    or respondent_user_id = auth.uid()
  )
  and (
    organization_id is null
    or exists (
      select 1
      from public.surveys s
      where s.id = survey_id
        and s.organization_id = organization_id
    )
  )
);

-- ---------------------------------------------------------------------
-- 3) Recriar policy de insert para public.survey_response_items
-- ---------------------------------------------------------------------
drop policy if exists "Allowed survey response item inserts" on public.survey_response_items;

create policy "Allowed survey response item inserts"
on public.survey_response_items
for insert
with check (
  public.can_insert_survey_response_item(response_id, question_id)
);

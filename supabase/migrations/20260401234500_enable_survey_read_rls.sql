-- =====================================================================
-- Migration: enable_survey_read_rls
-- Objetivo:
--   - Ativar RLS de leitura em public.surveys, public.survey_questions
--     e public.survey_question_options
--   - Permitir leitura pública apenas para surveys públicas, publicadas
--     e disponíveis no momento atual
--   - Permitir leitura de surveys privadas disponíveis para membros
--     ativos da organização
--   - Permitir leitura gerencial completa para OWNER ou membros com
--     permissão surveys.manage
-- =====================================================================

-- ---------------------------------------------------------------------
-- 0) Helpers de autorização reutilizáveis nas policies
-- ---------------------------------------------------------------------
create or replace function public.is_active_organization_member(
  p_organization_id uuid,
  p_user_id uuid default auth.uid()
) returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_memberships om
    where om.organization_id = p_organization_id
      and om.user_id = p_user_id
      and om.is_active = true
  );
$$;

comment on function public.is_active_organization_member(uuid, uuid) is
  'Retorna true quando o usuário informado possui membership ativa na organização.';

create or replace function public.can_manage_surveys(
  p_organization_id uuid,
  p_user_id uuid default auth.uid()
) returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_memberships om
    join public.roles r
      on r.id = om.role_id
     and r.is_active = true
    where om.organization_id = p_organization_id
      and om.user_id = p_user_id
      and om.is_active = true
      and (
        upper(trim(r.name)) = 'OWNER'
        or public.has_membership_permission(
          p_organization_id,
          p_user_id,
          'surveys.manage'
        )
      )
  );
$$;

comment on function public.can_manage_surveys(uuid, uuid) is
  'Retorna true quando o usuário é OWNER ou possui a permissão surveys.manage na organização.';

-- ---------------------------------------------------------------------
-- 1) Ativar RLS nas tabelas de leitura do módulo
-- ---------------------------------------------------------------------
alter table public.surveys enable row level security;
alter table public.survey_questions enable row level security;
alter table public.survey_question_options enable row level security;

-- ---------------------------------------------------------------------
-- 2) Recriar policies de leitura para public.surveys
-- ---------------------------------------------------------------------
drop policy if exists "Public and member survey reads" on public.surveys;

create policy "Public and member survey reads"
on public.surveys
for select
using (
  public.can_manage_surveys(organization_id)
  or (
    visibility = 'public'
    and status = 'published'
    and (starts_at is null or starts_at <= now())
    and (ends_at is null or ends_at >= now())
  )
  or (
    visibility = 'private'
    and status = 'published'
    and (starts_at is null or starts_at <= now())
    and (ends_at is null or ends_at >= now())
    and public.is_active_organization_member(organization_id)
  )
);

-- ---------------------------------------------------------------------
-- 3) Recriar policies de leitura para public.survey_questions
-- ---------------------------------------------------------------------
drop policy if exists "Readable questions follow readable surveys" on public.survey_questions;

create policy "Readable questions follow readable surveys"
on public.survey_questions
for select
using (
  exists (
    select 1
    from public.surveys s
    where s.id = survey_id
  )
);

-- ---------------------------------------------------------------------
-- 4) Recriar policies de leitura para public.survey_question_options
-- ---------------------------------------------------------------------
drop policy if exists "Readable options follow readable questions" on public.survey_question_options;

create policy "Readable options follow readable questions"
on public.survey_question_options
for select
using (
  exists (
    select 1
    from public.survey_questions sq
    where sq.id = question_id
  )
);

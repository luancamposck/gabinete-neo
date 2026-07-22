-- =====================================================================
-- Migration: create_referrals
-- Objetivo:
--   - Criar o log de indicações entre usuários dentro de uma organização.
--   - Registrar quem indicou quem, e o grau de parentesco informado.
--
-- Premissas:
--   - public.organizations já existe.
--   - public.users já existe.
--   - Tabela append-only: não possui updated_at nem trigger de update.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1) Table: public.referrals
-- ---------------------------------------------------------------------
create table public.referrals (
  -- Identificador único da indicação
  id uuid not null default gen_random_uuid(),

  -- Organização em que a indicação ocorreu
  organization_id uuid not null,

  -- Usuário que fez a indicação (dono do link de referral)
  inviter_user_id uuid not null,

  -- Usuário que se cadastrou a partir da indicação
  invited_user_id uuid not null,

  -- Relação do indicado com quem indicou (ex.: irmão, amigo, colega)
  relationship_to_inviter text null,

  -- Data/hora de criação do registro
  created_at timestamptz not null default now(),

  -- Garante que cada indicação tenha um único registro
  constraint referrals_pkey primary key (id),

  -- Mantém a indicação vinculada à organização
  constraint referrals_organization_id_fkey
    foreign key (organization_id)
    references public.organizations (id)
    on update cascade
    on delete cascade,

  -- Mantém a indicação vinculada a quem indicou
  constraint referrals_inviter_user_id_fkey
    foreign key (inviter_user_id)
    references public.users (id)
    on update cascade
    on delete cascade,

  -- Mantém a indicação vinculada a quem foi indicado
  constraint referrals_invited_user_id_fkey
    foreign key (invited_user_id)
    references public.users (id)
    on update cascade
    on delete cascade,

  -- Impede que um usuário indique a si mesmo
  constraint referrals_inviter_not_equal_invited_check
    check (inviter_user_id <> invited_user_id),

  -- Garante que cada usuário indicado tenha só um inviter por organização
  constraint referrals_organization_id_invited_user_id_key
    unique (organization_id, invited_user_id)
) tablespace pg_default;

comment on table public.referrals is
  'Log de indicações entre usuários dentro de uma organização.';

comment on column public.referrals.id is
  'Identificador único da indicação.';

comment on column public.referrals.organization_id is
  'Organização em que a indicação ocorreu.';

comment on column public.referrals.inviter_user_id is
  'Usuário que fez a indicação (dono do link de referral).';

comment on column public.referrals.invited_user_id is
  'Usuário que se cadastrou a partir da indicação.';

comment on column public.referrals.relationship_to_inviter is
  'Relação do indicado com quem indicou (ex.: irmão, amigo, colega), texto livre validado no app.';

comment on column public.referrals.created_at is
  'Timestamp de criação do registro.';


-- ---------------------------------------------------------------------
-- 2) Indexes
-- ---------------------------------------------------------------------
create index if not exists referrals_organization_id_inviter_user_id_idx
  on public.referrals using btree (organization_id, inviter_user_id);

create index if not exists referrals_organization_id_invited_user_id_idx
  on public.referrals using btree (organization_id, invited_user_id);

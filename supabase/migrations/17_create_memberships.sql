-- =====================================================================
-- Migration: create_memberships
-- Objetivo:
--   - Criar a tabela de vínculo entre usuários e organizações (N:N).
--   - Registrar o papel (role) do usuário dentro da organização.
--
-- Premissas:
--   - public.users já existe.
--   - public.organizations já existe.
--   - public.roles já existe.
--   - public.handle_updated_at() já existe.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1) Table: public.memberships
-- ---------------------------------------------------------------------
create table public.memberships (
  -- Organização à qual o usuário pertence
  organization_id uuid not null,

  -- Usuário membro da organização
  user_id uuid not null,

  -- Papel do usuário dentro da organização
  role_id uuid not null,

  -- Usuário que convidou/adicionou este membro à organização
  invited_by_user_id uuid null,

  -- Indica se o vínculo do usuário com a organização está ativo
  is_active boolean not null default true,

  -- Data/hora em que o usuário entrou na organização
  created_at timestamptz not null default now(),

  -- Data/hora da última atualização do vínculo
  updated_at timestamptz not null default now(),

  -- Garante que um usuário só tenha um vínculo por organização
  constraint memberships_pkey
    primary key (organization_id, user_id),

  -- Mantém a membership vinculada à organização
  constraint memberships_organization_id_fkey
    foreign key (organization_id)
    references public.organizations (id)
    on update cascade
    on delete cascade,

  -- Mantém a membership vinculada ao usuário
  constraint memberships_user_id_fkey
    foreign key (user_id)
    references public.users (id)
    on update cascade
    on delete cascade,

  -- Mantém a membership vinculada ao papel atribuído
  -- Não permite remover uma role enquanto houver membership usando-a
  constraint memberships_role_id_fkey
    foreign key (role_id)
    references public.roles (id)
    on update cascade
    on delete restrict,

  -- Preserva o histórico mesmo se quem convidou for removido
  constraint memberships_invited_by_user_id_fkey
    foreign key (invited_by_user_id)
    references public.users (id)
    on update cascade
    on delete set null
) tablespace pg_default;

comment on table public.memberships is
  'Vínculo entre usuários (public.users) e organizações (public.organizations), com papel e status.';

comment on column public.memberships.organization_id is
  'Organização à qual o usuário pertence.';

comment on column public.memberships.user_id is
  'Usuário membro da organização.';

comment on column public.memberships.role_id is
  'Papel do usuário dentro da organização (public.roles.id).';

comment on column public.memberships.invited_by_user_id is
  'Usuário que convidou/adicionou este membro à organização, quando aplicável.';

comment on column public.memberships.is_active is
  'Indica se o vínculo do usuário com a organização está ativo.';

comment on column public.memberships.created_at is
  'Timestamp de quando o usuário passou a fazer parte da organização.';

comment on column public.memberships.updated_at is
  'Timestamp atualizado automaticamente em UPDATE.';


-- ---------------------------------------------------------------------
-- 2) Indexes
-- ---------------------------------------------------------------------
create index if not exists memberships_user_id_idx
  on public.memberships using btree (user_id);

create index if not exists memberships_role_id_idx
  on public.memberships using btree (role_id);

create index if not exists memberships_invited_by_user_id_idx
  on public.memberships using btree (invited_by_user_id);


-- ---------------------------------------------------------------------
-- 3) Trigger: updated_at
-- ---------------------------------------------------------------------
create trigger on_memberships_updated
before update on public.memberships
for each row
execute function public.handle_updated_at();

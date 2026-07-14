-- =====================================================================
-- Migration: create_organization_memberships
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
-- 1) Table: public.organization_memberships
-- ---------------------------------------------------------------------
create table public.organization_memberships (
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
  constraint organization_memberships_pkey
    primary key (organization_id, user_id),

  -- Mantém a membership vinculada à organização
  constraint organization_memberships_organization_id_fkey
    foreign key (organization_id)
    references public.organizations (id)
    on update cascade
    on delete cascade,

  -- Mantém a membership vinculada ao usuário
  constraint organization_memberships_user_id_fkey
    foreign key (user_id)
    references public.users (id)
    on update cascade
    on delete cascade,

  -- Mantém a membership vinculada ao papel atribuído
  -- Não permite remover uma role enquanto houver membership usando-a
  constraint organization_memberships_role_id_fkey
    foreign key (role_id)
    references public.roles (id)
    on update cascade
    on delete restrict,

  -- Preserva o histórico mesmo se quem convidou for removido
  constraint organization_memberships_invited_by_user_id_fkey
    foreign key (invited_by_user_id)
    references public.users (id)
    on update cascade
    on delete set null
) tablespace pg_default;

comment on table public.organization_memberships is
  'Vínculo entre usuários (public.users) e organizações (public.organizations), com papel e status.';

comment on column public.organization_memberships.organization_id is
  'Organização à qual o usuário pertence.';

comment on column public.organization_memberships.user_id is
  'Usuário membro da organização.';

comment on column public.organization_memberships.role_id is
  'Papel do usuário dentro da organização (public.roles.id).';

comment on column public.organization_memberships.invited_by_user_id is
  'Usuário que convidou/adicionou este membro à organização, quando aplicável.';

comment on column public.organization_memberships.is_active is
  'Indica se o vínculo do usuário com a organização está ativo.';

comment on column public.organization_memberships.created_at is
  'Timestamp de quando o usuário passou a fazer parte da organização.';

comment on column public.organization_memberships.updated_at is
  'Timestamp atualizado automaticamente em UPDATE.';


-- ---------------------------------------------------------------------
-- 2) Indexes
-- ---------------------------------------------------------------------
create index if not exists organization_memberships_user_id_idx
  on public.organization_memberships using btree (user_id);

create index if not exists organization_memberships_role_id_idx
  on public.organization_memberships using btree (role_id);

create index if not exists organization_memberships_invited_by_user_id_idx
  on public.organization_memberships using btree (invited_by_user_id);


-- ---------------------------------------------------------------------
-- 3) Trigger: updated_at
-- ---------------------------------------------------------------------
create trigger on_organization_memberships_updated
before update on public.organization_memberships
for each row
execute function public.handle_updated_at();

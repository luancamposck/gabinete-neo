-- =====================================================================
-- Migration: create_table_organization_memberships
-- Objetivo:
--   - Criar a tabela public.organization_memberships
--   - Representar o vínculo entre usuários e organizações (N:N)
--   - Incluir papel (role) do usuário dentro da organização
--   - Adicionar trigger para manter updated_at atualizado
--
-- Premissas:
--   - A função public.handle_updated_at() já existe
--   - As tabelas public.users e public.organizations já foram criadas
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1) Tabela public.organization_memberships
--
-- Conceito:
--   - Representa a associação de um usuário a uma organização.
--   - Permite controlar papéis (OWNER, ADMIN, MEMBER) e status.
--
-- Notas:
--   - Chave primária composta (organization_id, user_id) garante
--     que um mesmo usuário não tenha duas memberships duplicadas
--     para a mesma organização.
-- ---------------------------------------------------------------------
create table public.organization_memberships (
  -- Organização à qual o usuário pertence
  organization_id uuid not null,

  -- Usuário membro da organização
  user_id uuid not null,

  -- Papel do usuário dentro da organização
  -- Valores sugeridos: 'OWNER', 'ADMIN', 'MEMBER'
  role text not null
    check (role in ('OWNER', 'ADMIN', 'MEMBER')),

  -- Indica se o vínculo do usuário com a organização está ativo
  is_active boolean not null default true,

  -- Data/hora em que o usuário entrou na organização
  created_at timestamp with time zone not null default now(),

  -- Data/hora da última atualização do vínculo
  updated_at timestamp with time zone not null default now(),

  -- Chave primária composta: um usuário só pode ter um registro por organização
  constraint organization_memberships_pkey
    primary key (organization_id, user_id),

  -- Relaciona com a tabela de organizações
  constraint organization_memberships_organization_id_fkey
    foreign key (organization_id)
    references public.organizations (id)
    on delete cascade,

  -- Relaciona com a tabela de usuários da aplicação
  constraint organization_memberships_user_id_fkey
    foreign key (user_id)
    references public.users (id)
    on delete cascade
) tablespace pg_default;


comment on table public.organization_memberships is
  'Vínculo entre usuários (public.users) e organizações (public.organizations), com papel e status.';

comment on column public.organization_memberships.organization_id is
  'Identificador da organização à qual o usuário pertence.';

comment on column public.organization_memberships.user_id is
  'Identificador do usuário membro da organização (public.users.id).';

comment on column public.organization_memberships.role is
  'Papel do usuário na organização (ex.: OWNER, ADMIN, MEMBER).';

comment on column public.organization_memberships.is_active is
  'Indica se o vínculo do usuário com a organização está ativo.';

comment on column public.organization_memberships.created_at is
  'Timestamp de quando o usuário passou a fazer parte da organização.';

comment on column public.organization_memberships.updated_at is
  'Timestamp da última atualização do vínculo. Atualizado via trigger.';


-- ---------------------------------------------------------------------
-- 2) Índices auxiliares
--
-- Objetivo:
--   - Otimizar consultas por user_id (ex.: "quais orgs esse usuário tem?")
-- ---------------------------------------------------------------------
create index if not exists organization_memberships_user_id_idx
  on public.organization_memberships using btree (user_id)
  tablespace pg_default;


-- ---------------------------------------------------------------------
-- 3) Trigger: on_organization_memberships_updated
--
-- Objetivo:
--   - Atualizar automaticamente updated_at em toda operação de UPDATE.
--
-- Observação:
--   - Usa a função genérica public.handle_updated_at().
-- ---------------------------------------------------------------------
create trigger on_organization_memberships_updated
before update on public.organization_memberships
for each row
execute function public.handle_updated_at();

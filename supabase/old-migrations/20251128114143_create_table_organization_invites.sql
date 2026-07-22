-- =====================================================================
-- Migration: create_table_organization_invites
-- Objetivo:
--   - Criar a tabela public.organization_invites
--   - Registrar pedidos de acesso a uma organização (via link público ou outros canais)
--   - Permitir que OWNER/ADMIN aprovem ou rejeitem esses pedidos
--   - Manter histórico de status, origem e quem tomou a decisão
--
-- Premissas:
--   - A função public.handle_updated_at() já existe
--   - As tabelas public.organizations e public.users já foram criadas
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1) Tabela public.organization_invites
--
-- Conceito:
--   - Representa um pedido de participação em uma organização.
--   - Pode ter sido criado via link público, convite por email, etc.
--   - Enquanto status = 'PENDING', o usuário ainda não é membro da org.
--   - Ao ser aprovado, gera/reativa um registro em public.organization_memberships.
--
-- Campos principais:
--   - id: identificador único do invite/pedido.
--   - organization_id: organização alvo do pedido.
--   - requested_by_user_id: usuário que pediu para entrar.
--   - role: papel que o usuário terá se for aprovado (ex.: MEMBER, ADMIN).
--   - status: situação atual do pedido (PENDING, APPROVED, REJECTED, ...).
--   - origin: de onde veio o pedido (ex.: PUBLIC_LINK, EMAIL_INVITE).
--   - handled_by_user_id: quem aprovou/rejeitou o pedido.
--   - handled_at: quando o pedido foi tratado.
-- ---------------------------------------------------------------------
create table public.organization_invites (
  -- Identificador único da solicitação de convite/pedido de acesso
  id uuid not null default gen_random_uuid(),

  -- Organização para a qual o usuário está pedindo acesso
  organization_id uuid not null,

  -- Usuário que está pedindo para entrar na organização
  requested_by_user_id uuid not null,

  -- Papel desejado para o usuário dentro da organização
  -- Valores atuais: 'MEMBER', 'ADMIN'
  -- (pode ser expandido futuramente conforme necessidade)
  role text not null
    check (role in ('MEMBER', 'ADMIN')),

  -- Status atual do pedido
  --   - PENDING : aguardando aprovação do OWNER/ADMIN
  --   - APPROVED: pedido aprovado, membership criado/reativado
  --   - REJECTED: pedido rejeitado
  --   - EXPIRED : pedido expirado (opcional, via regra de negócio)
  --   - CANCELED: pedido cancelado (ex.: pelo próprio usuário ou admin)
  status text not null
    check (status in ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED', 'CANCELED')),

  -- Origem do pedido/convite
  --   - PUBLIC_LINK : criado via link público de entrada
  --   - EMAIL_INVITE: criado a partir de convite enviado por email (futuro)
  --   - INTERNAL    : criado internamente via painel/admin (futuro)
  origin text not null default 'PUBLIC_LINK'
    check (origin in ('PUBLIC_LINK', 'EMAIL_INVITE', 'INTERNAL')),

  -- Usuário que aprovou ou rejeitou o pedido
  handled_by_user_id uuid null,

  -- Data/hora em que o pedido foi aprovado/rejeitado
  handled_at timestamp with time zone null,

  -- Data/hora limite em que esse pedido é considerado válido
  -- (opcionalmente usada pela camada de negócio para expirar pedidos antigos)
  expires_at timestamp with time zone null,

  -- Data/hora de criação do pedido
  created_at timestamp with time zone not null default now(),

  -- Data/hora da última atualização do pedido
  updated_at timestamp with time zone not null default now(),

  -- Chave primária
  constraint organization_invites_pkey primary key (id),

  -- FK para a organização alvo do pedido
  constraint organization_invites_organization_id_fkey
    foreign key (organization_id)
    references public.organizations (id)
    on delete cascade,

  -- FK para o usuário que está pedindo acesso
  constraint organization_invites_requested_by_user_id_fkey
    foreign key (requested_by_user_id)
    references public.users (id)
    on delete cascade,

  -- FK para o usuário que aprovou/rejeitou o pedido
  constraint organization_invites_handled_by_user_id_fkey
    foreign key (handled_by_user_id)
    references public.users (id)
    on delete set null
) tablespace pg_default;


comment on table public.organization_invites is
  'Pedidos de acesso a organizações (via link público, email ou outros canais), aguardando aprovação de OWNER/ADMIN.';

comment on column public.organization_invites.id is
  'Identificador único (UUID) da solicitação de convite/pedido de acesso.';

comment on column public.organization_invites.organization_id is
  'Organização para a qual o usuário está pedindo acesso.';

comment on column public.organization_invites.requested_by_user_id is
  'Usuário que pediu para entrar na organização (public.users.id).';

comment on column public.organization_invites.role is
  'Papel que o usuário terá na organização se o pedido for aprovado (ex.: MEMBER, ADMIN).';

comment on column public.organization_invites.status is
  'Status atual do pedido: PENDING, APPROVED, REJECTED, EXPIRED ou CANCELED.';

comment on column public.organization_invites.origin is
  'Origem do pedido/convite: PUBLIC_LINK, EMAIL_INVITE ou INTERNAL.';

comment on column public.organization_invites.handled_by_user_id is
  'Usuário que aprovou ou rejeitou o pedido, quando aplicável.';

comment on column public.organization_invites.handled_at is
  'Data/hora em que o pedido foi aprovado ou rejeitado.';

comment on column public.organization_invites.expires_at is
  'Data/hora limite em que o pedido é considerado válido (pode ser null).';

comment on column public.organization_invites.created_at is
  'Timestamp de criação do pedido. Definido automaticamente como now().';

comment on column public.organization_invites.updated_at is
  'Timestamp da última atualização do pedido. Atualizado via trigger.';


-- ---------------------------------------------------------------------
-- 2) Índices auxiliares
--
-- Objetivo:
--   - Otimizar consultas por organização e por usuário solicitante
--   - Exemplos de uso:
--       - Listar pedidos pendentes de uma organização
--       - Listar pedidos feitos por um determinado usuário
-- ---------------------------------------------------------------------
create index if not exists organization_invites_organization_id_idx
  on public.organization_invites using btree (organization_id)
  tablespace pg_default;

create index if not exists organization_invites_requested_by_user_id_idx
  on public.organization_invites using btree (requested_by_user_id)
  tablespace pg_default;

create index if not exists organization_invites_status_idx
  on public.organization_invites using btree (status)
  tablespace pg_default;


-- ---------------------------------------------------------------------
-- 3) Trigger: on_organization_invites_updated
--
-- Objetivo:
--   - Atualizar automaticamente updated_at em toda operação de UPDATE.
--
-- Observação:
--   - Usa a função genérica public.handle_updated_at().
--   - Padrão de nome de trigger: on_<table>_updated
-- ---------------------------------------------------------------------
create trigger on_organization_invites_updated
before update on public.organization_invites
for each row
execute function public.handle_updated_at();

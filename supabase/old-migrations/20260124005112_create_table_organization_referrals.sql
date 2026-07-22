-- =====================================================================
-- Migration: create_table_organization_referrals
-- Objetivo:
--   - Criar a tabela public.organization_referrals
--   - Registrar relações de indicação (referral) dentro de uma organização
--   - Permitir contar quantos usuários cada usuário convidou
--   - Permitir descobrir quem convidou um usuário (por organização)
--   - Guardar o relationship_to_inviter informado no cadastro
--
-- Premissas:
--   - As tabelas public.organizations e public.users já existem
--   - A tabela public.organization_invites permanece como está (não alterada)
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1) Tabela public.organization_referrals
--
-- Conceito:
--   - Cada linha representa uma indicação efetivada:
--       inviter_user_id  -> convidou ->  invited_user_id
--   - Multi-tenant: sempre vinculada a uma organização.
--   - Um usuário só pode ter um convidador por organização (unique).
-- ---------------------------------------------------------------------
create table public.organization_referrals (
  -- Identificador único do referral
  id uuid not null default gen_random_uuid(),

  -- Organização onde o referral ocorreu (multi-tenant)
  organization_id uuid not null,

  -- Usuário que convidou (quem gerou o link / ref)
  inviter_user_id uuid not null,

  -- Usuário que entrou/cadastrou usando o ref
  invited_user_id uuid not null,

  -- Grau de relacionamento declarado no cadastro (opcional)
  relationship_to_inviter text null,

  -- Auditoria temporal (evento append-only)
  created_at timestamptz not null default now(),

  -- Chave primária simples
  constraint organization_referrals_pkey primary key (id),

  -- FK: organização
  constraint organization_referrals_organization_id_fkey
    foreign key (organization_id)
    references public.organizations (id)
    on update cascade
    on delete cascade,

  -- FK: quem convidou
  constraint organization_referrals_inviter_user_id_fkey
    foreign key (inviter_user_id)
    references public.users (id)
    on update cascade
    on delete cascade,

  -- FK: quem foi convidado
  constraint organization_referrals_invited_user_id_fkey
    foreign key (invited_user_id)
    references public.users (id)
    on update cascade
    on delete cascade,

  -- Evita auto-convite
  constraint organization_referrals_inviter_not_equal_invited_check
    check (inviter_user_id <> invited_user_id),

  -- Um usuário só pode ter um convidador por organização
  constraint organization_referrals_organization_id_invited_user_id_key
    unique (organization_id, invited_user_id)
);


-- ---------------------------------------------------------------------
-- 2) Índices auxiliares
--
-- Objetivo:
--   - Otimizar consultas típicas:
--     * Contar quantos um usuário convidou (por organização)
--     * Descobrir quem convidou um usuário (por organização)
-- ---------------------------------------------------------------------

-- Contagem de convidados por usuário (ranking/estatísticas)
create index organization_referrals_organization_id_inviter_user_id_idx
  on public.organization_referrals (organization_id, inviter_user_id);

-- Buscar convidador de um usuário específico
create index organization_referrals_organization_id_invited_user_id_idx
  on public.organization_referrals (organization_id, invited_user_id);

-- =====================================================================
-- Migration: create_table_organization_tasks
-- Objetivo:
--   - Criar a tabela public.organization_tasks
--   - Representar tarefas pertencentes a uma organização (multi-tenant)
--   - Registrar quem criou e quem atualizou a task
--   - Adicionar campo status com enum tipado
--   - Adicionar trigger para manter updated_at atualizado
--
-- Premissas:
--   - A função public.handle_updated_at() já existe
--   - As tabelas public.users e public.organizations já foram criadas
-- =====================================================================


-- ---------------------------------------------------------------------
-- 0) Enum: organization_task_status
--
-- Valores:
--   - NOT_STARTED  (Não iniciado)
--   - IN_PROGRESS  (Em andamento)
--   - CANCELLED    (Cancelado)
--   - COMPLETED    (Concluído)
-- ---------------------------------------------------------------------
create type public.organization_task_status as enum (
  'NOT_STARTED',
  'IN_PROGRESS',
  'CANCELLED',
  'COMPLETED'
);


-- ---------------------------------------------------------------------
-- 1) Tabela public.organization_tasks
--
-- Conceito:
--   - Cada linha representa uma "task" dentro de uma organização.
--   - Uma task sempre pertence a exatamente uma organização.
--   - Mantém auditoria de criação/atualização por usuário.
-- ---------------------------------------------------------------------
create table public.organization_tasks (
  -- Identificador único da task
  id uuid not null default gen_random_uuid(),

  -- Organização dona da task (multi-tenant)
  organization_id uuid not null,

  -- Usuário que criou a task
  created_by_user_id uuid not null,

  -- Último usuário que atualizou a task (pode ser o mesmo que criou)
  updated_by_user_id uuid null,

  -- Título da task (curto, usado em listagens)
  title text not null,

  -- Descrição detalhada da task (opcional)
  description text null,

  -- Status atual da task
  status public.organization_task_status not null default 'NOT_STARTED',

  -- Auditoria temporal
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Chave primária simples
  constraint organization_tasks_pkey primary key (id),

  -- FK: organização dona da task
  constraint organization_tasks_organization_id_fkey
    foreign key (organization_id)
    references public.organizations (id)
    on update cascade
    on delete cascade,

  -- FK: usuário que criou a task
  constraint organization_tasks_created_by_user_id_fkey
    foreign key (created_by_user_id)
    references public.users (id)
    on update cascade
    on delete restrict,

  -- FK: último usuário que atualizou a task
  constraint organization_tasks_updated_by_user_id_fkey
    foreign key (updated_by_user_id)
    references public.users (id)
    on update cascade
    on delete set null
);

-- Constraint auxiliar para permitir FK composta (task_id, organization_id)
-- na tabela de assignments, garantindo consistência multi-tenant.
alter table public.organization_tasks
  add constraint organization_tasks_id_organization_id_key
  unique (id, organization_id);


-- ---------------------------------------------------------------------
-- 2) Índices auxiliares
--
-- Objetivo:
--   - Otimizar consultas típicas:
--     * Listar tasks de uma organização
--     * Listar tasks criadas por um usuário
-- ---------------------------------------------------------------------

-- Tasks por organização (consulta mais comum)
create index organization_tasks_organization_id_idx
  on public.organization_tasks (organization_id);

-- Tasks por usuário criador
create index organization_tasks_created_by_user_id_idx
  on public.organization_tasks (created_by_user_id);


-- ---------------------------------------------------------------------
-- 3) Trigger: on_organization_tasks_updated
--
-- Objetivo:
--   - Atualizar automaticamente updated_at em toda operação de UPDATE.
--
-- Observação:
--   - Usa a função genérica public.handle_updated_at().
--   - Padrão de nome de trigger: on_<table>_updated
-- ---------------------------------------------------------------------
create trigger on_organization_tasks_updated
before update on public.organization_tasks
for each row
execute function public.handle_updated_at();

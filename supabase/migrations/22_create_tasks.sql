-- =====================================================================
-- Migration: create_tasks
-- Objetivo:
--   - Criar a tabela de tarefas internas de uma organização.
--
-- Premissas:
--   - public.organizations já existe.
--   - public.users já existe.
--   - public.handle_updated_at() já existe.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1) Enum: public.task_status
-- ---------------------------------------------------------------------
create type public.task_status as enum (
  'NOT_STARTED',
  'IN_PROGRESS',
  'CANCELLED',
  'COMPLETED'
);


-- ---------------------------------------------------------------------
-- 2) Table: public.tasks
-- ---------------------------------------------------------------------
create table public.tasks (
  -- Identificador único da task
  id uuid not null default gen_random_uuid(),

  -- Organização dona da task
  organization_id uuid not null,

  -- Usuário que criou a task
  created_by_user_id uuid not null,

  -- Usuário que fez a última atualização da task
  updated_by_user_id uuid null,

  -- Título da task
  title text not null,

  -- Descrição opcional da task
  description text null,

  -- Situação atual da task
  status public.task_status not null default 'NOT_STARTED',

  -- Data/hora de criação do registro
  created_at timestamptz not null default now(),

  -- Data/hora da última atualização do registro
  updated_at timestamptz not null default now(),

  -- Data/hora limite opcional para conclusão da task
  due_at timestamptz null,

  -- Garante que cada task tenha um único registro
  constraint tasks_pkey primary key (id),

  -- Mantém a task vinculada à organização
  constraint tasks_organization_id_fkey
    foreign key (organization_id)
    references public.organizations (id)
    on update cascade
    on delete cascade,

  -- Mantém a task vinculada a quem a criou
  constraint tasks_created_by_user_id_fkey
    foreign key (created_by_user_id)
    references public.users (id)
    on update cascade
    on delete restrict,

  -- Preserva a task mesmo se quem a atualizou por último for removido
  constraint tasks_updated_by_user_id_fkey
    foreign key (updated_by_user_id)
    references public.users (id)
    on update cascade
    on delete set null,

  -- Constraint auxiliar (sem uso direto por si só) que existe apenas para
  -- viabilizar a FK composta (task_id, organization_id) em
  -- public.task_assignments, garantindo no banco que uma assignment nunca
  -- referencie uma task de uma organização diferente da informada.
  constraint tasks_id_organization_id_key
    unique (id, organization_id)
) tablespace pg_default;

comment on table public.tasks is
  'Tarefas internas de uma organização.';

comment on column public.tasks.id is
  'Identificador único da task.';

comment on column public.tasks.organization_id is
  'Organização dona da task.';

comment on column public.tasks.created_by_user_id is
  'Usuário que criou a task.';

comment on column public.tasks.updated_by_user_id is
  'Usuário que fez a última atualização da task, quando aplicável.';

comment on column public.tasks.title is
  'Título da task.';

comment on column public.tasks.description is
  'Descrição opcional da task.';

comment on column public.tasks.status is
  'Situação atual da task.';

comment on column public.tasks.created_at is
  'Timestamp de criação do registro.';

comment on column public.tasks.updated_at is
  'Timestamp atualizado automaticamente em UPDATE.';

comment on column public.tasks.due_at is
  'Data/hora limite opcional para conclusão da task.';


-- ---------------------------------------------------------------------
-- 3) Indexes
-- ---------------------------------------------------------------------
create index if not exists tasks_organization_id_idx
  on public.tasks using btree (organization_id);

create index if not exists tasks_created_by_user_id_idx
  on public.tasks using btree (created_by_user_id);

create index if not exists tasks_due_at_idx
  on public.tasks using btree (due_at);


-- ---------------------------------------------------------------------
-- 4) Trigger: updated_at
-- ---------------------------------------------------------------------
create trigger on_tasks_updated
before update on public.tasks
for each row
execute function public.handle_updated_at();

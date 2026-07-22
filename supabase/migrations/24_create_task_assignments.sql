-- =====================================================================
-- Migration: create_task_assignments
-- Objetivo:
--   - Criar o vínculo entre tasks e os usuários atribuídos a elas.
--
-- Premissas:
--   - public.tasks já existe.
--   - public.memberships já existe.
--   - public.users já existe.
--   - public.handle_updated_at() já existe.
--   - Não existe coluna "role": no legado essa coluna era texto livre,
--     sempre gravada com o mesmo valor fixo pelo código e nunca lida de
--     volta pela aplicação (nem exibida na UI) — placeholder especulativo
--     sem uso real. Se um dia houver necessidade real de diferenciar
--     papéis por atribuição de task, adicionar em migration própria.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1) Table: public.task_assignments
-- ---------------------------------------------------------------------
create table public.task_assignments (
  -- Task à qual o usuário está atribuído
  task_id uuid not null,

  -- Organização dona da task e da membership do usuário atribuído.
  -- Não é usada como filtro de query pela aplicação: existe só para
  -- viabilizar as FKs compostas abaixo, que garantem no banco que uma
  -- assignment nunca misture task e usuário de organizações diferentes.
  organization_id uuid not null,

  -- Usuário atribuído à task
  user_id uuid not null,

  -- Data/hora em que a atribuição foi criada
  created_at timestamptz not null default now(),

  -- Data/hora da última atualização da atribuição
  updated_at timestamptz not null default now(),

  -- Garante que um usuário só tenha uma atribuição por task
  constraint task_assignments_pkey
    primary key (task_id, user_id),

  -- Garante que a task referenciada pertence à organização informada
  constraint task_assignments_task_fk
    foreign key (task_id, organization_id)
    references public.tasks (id, organization_id)
    on update cascade
    on delete cascade,

  -- Garante que o usuário atribuído é membro ativo daquela organização
  constraint task_assignments_membership_fk
    foreign key (organization_id, user_id)
    references public.memberships (organization_id, user_id)
    on update cascade
    on delete cascade,

  -- Mantida apenas para permitir que o Supabase gere o relacionamento
  -- usado em selects embutidos do tipo:
  --   user:users!task_assignments_user_id_fkey (...)
  -- A validade de user_id já é garantida pela FK de membership acima.
  constraint task_assignments_user_id_fkey
    foreign key (user_id)
    references public.users (id)
    on update cascade
    on delete restrict
) tablespace pg_default;

comment on table public.task_assignments is
  'Vínculo entre tasks (public.tasks) e os usuários atribuídos a elas.';

comment on column public.task_assignments.task_id is
  'Task à qual o usuário está atribuído.';

comment on column public.task_assignments.organization_id is
  'Organização dona da task e da membership do usuário atribuído; usada apenas para viabilizar as FKs compostas de isolamento multi-tenant.';

comment on column public.task_assignments.user_id is
  'Usuário atribuído à task.';

comment on column public.task_assignments.created_at is
  'Timestamp de criação da atribuição.';

comment on column public.task_assignments.updated_at is
  'Timestamp atualizado automaticamente em UPDATE.';


-- ---------------------------------------------------------------------
-- 2) Indexes
-- ---------------------------------------------------------------------
create index if not exists task_assignments_organization_id_user_id_idx
  on public.task_assignments using btree (organization_id, user_id);

create index if not exists task_assignments_task_id_idx
  on public.task_assignments using btree (task_id);


-- ---------------------------------------------------------------------
-- 3) Trigger: updated_at
-- ---------------------------------------------------------------------
create trigger on_task_assignments_updated
before update on public.task_assignments
for each row
execute function public.handle_updated_at();

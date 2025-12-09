-- =====================================================================
-- Migration: create_table_organization_task_assignments
-- Objetivo:
--   - Criar a tabela public.organization_task_assignments
--   - Representar a atribuição de usuários a tasks de uma organização
--   - Permitir atribuir múltiplas pessoas a uma mesma task
--   - Incluir um campo role para uso futuro em permissões
--   - Adicionar trigger para manter updated_at atualizado
--
-- Premissas:
--   - A função public.handle_updated_at() já existe
--   - As tabelas:
--       - public.organization_tasks
--       - public.organization_memberships
--     já foram criadas
--   - organization_memberships possui PK composta (organization_id, user_id)
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1) Tabela public.organization_task_assignments
--
-- Conceito:
--   - Cada linha representa um vínculo "task X atribuída para Y".
--   - Uma task pode ter vários usuários atribuídos.
--   - Um usuário pode estar atribuído a várias tasks.
--   - O campo role permite diferenciar o papel do usuário na task
--     (ex: RESPONSIBLE, COLLABORATOR, OBSERVER etc.).
-- ---------------------------------------------------------------------
create table public.organization_task_assignments (
  -- Task à qual o usuário está atribuído
  task_id uuid not null,

  -- Organização à qual a task pertence (multi-tenant)
  organization_id uuid not null,

  -- Usuário atribuído à task
  user_id uuid not null,

  -- Papel do usuário na task (texto livre por enquanto;
  -- pode virar ENUM ou CHECK em migration futura)
  role text not null,

  -- Auditoria temporal
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Chave primária composta:
  --   - Garante que um usuário só tenha uma assignment por task.
  constraint organization_task_assignments_pkey
    primary key (task_id, user_id),

  -- Task deve existir e pertencer à mesma organização.
  -- Usa a UNIQUE (id, organization_id) definida em organization_tasks.
  constraint organization_task_assignments_task_fk
    foreign key (task_id, organization_id)
    references public.organization_tasks (id, organization_id)
    on update cascade
    on delete cascade,

  -- Usuário deve ser membro da organização.
  -- Usa a PK (organization_id, user_id) de organization_memberships.
  constraint organization_task_assignments_membership_fk
    foreign key (organization_id, user_id)
    references public.organization_memberships (organization_id, user_id)
    on update cascade
    on delete cascade
);


-- ---------------------------------------------------------------------
-- 2) Índices auxiliares
--
-- Objetivo:
--   - Otimizar consultas típicas:
--     * Listar todas as tasks de um usuário em uma organização
--     * Listar todos os usuários atribuídos a uma task
-- ---------------------------------------------------------------------

-- Consultas por (organization_id, user_id):
-- "quais tasks o usuário X tem na org Y?"
create index organization_task_assignments_org_user_idx
  on public.organization_task_assignments (organization_id, user_id);

-- Consultas por task:
-- "quem está atribuído a essa task?"
create index organization_task_assignments_task_id_idx
  on public.organization_task_assignments (task_id);


-- ---------------------------------------------------------------------
-- 3) Trigger: on_organization_task_assignments_updated
--
-- Objetivo:
--   - Atualizar automaticamente updated_at em toda operação de UPDATE.
--
-- Observação:
--   - Usa a função genérica public.handle_updated_at().
-- ---------------------------------------------------------------------
create trigger on_organization_task_assignments_updated
before update on public.organization_task_assignments
for each row
execute function public.handle_updated_at();

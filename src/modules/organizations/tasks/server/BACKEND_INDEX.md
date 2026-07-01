# organizations/tasks/server

Índice da camada server-side de `organizations/tasks`.

Este arquivo serve como mapa rápido para entender entrypoints, arquivos principais, dependências e fluxos backend deste submódulo.

---

## Visao geral

Este submódulo concentra tarefas da organização: criação de tarefas, listagem para tabela, busca de usuários atribuíveis e atribuição de usuários a tarefas.

---

## Entrypoints

| Entrypoint | Arquivo | Observações |
|---|---|---|
| `createTaskAction` | `./slices/create-task/actions/create-task.action.ts` | Cria tarefa e revalida `/dashboard/task` |
| `getTasksForTableAction` | `./slices/get-tasks-for-table/actions/get-tasks-for-table.action.ts` | Lista tarefas e normaliza DTO de tabela |
| `getAssignableUsersAction` | `./slices/get-assignable-users/actions/get-assignable-users.action.ts` | Lista membros atribuíveis e assignments atuais |
| `assignUsersToTaskAction` | `./slices/assign-users-to-task/actions/assign-users-to-task.action.ts` | Atribui usuários e revalida `/dashboard/task` |

---

## Slices

| Slice | Caminho | Responsabilidade |
|---|---|---|
| `create-task` | `./slices/create-task/` | Criar tarefa da organização atual |
| `get-tasks-for-table` | `./slices/get-tasks-for-table/` | Preparar tarefas para tabela |
| `get-assignable-users` | `./slices/get-assignable-users/` | Preparar membros e assignments para UI de atribuição |
| `assign-users-to-task` | `./slices/assign-users-to-task/` | Inserir assignments em massa |

---

## Actions

| Action | Caminho | Observações |
|---|---|---|
| `createTaskAction` | `./slices/create-task/actions/create-task.action.ts` | Revalida `/dashboard/task` após sucesso |
| `getTasksForTableAction` | `./slices/get-tasks-for-table/actions/get-tasks-for-table.action.ts` | Converte campos snake_case para DTO de tabela |
| `getAssignableUsersAction` | `./slices/get-assignable-users/actions/get-assignable-users.action.ts` | Separa `members` e `assignedUserIds` |
| `assignUsersToTaskAction` | `./slices/assign-users-to-task/actions/assign-users-to-task.action.ts` | Revalida `/dashboard/task` após sucesso |

---

## Use-cases

| Use-case | Caminho | Observações |
|---|---|---|
| `createTaskUseCase` | `./slices/create-task/use-cases/create-task.use-case.ts` | Autentica, resolve tenant, valida membership, valida schema server e cria task |
| `getTasksForTableUseCase` | `./slices/get-tasks-for-table/use-cases/get-tasks-for-table.use-case.ts` | Autentica, resolve tenant, valida membership e lista tasks |
| `getAssignableUsersUseCase` | `./slices/get-assignable-users/use-cases/get-assignable-users.use-case.ts` | Autentica, valida taskId, lista membros e assignments |
| `assignUsersToTaskUseCase` | `./slices/assign-users-to-task/use-cases/assign-users-to-task.use-case.ts` | Autentica, valida membership e insere assignments |

---

## Services locais

| Service | Caminho | Responsabilidade |
|---|---|---|
| `createOrganizationTaskService` | `./services/create-organization-task.service.ts` | Insere tarefa em `organization_tasks` |
| `listOrganizationTasksWithCreatorService` | `./services/list-organization-tasks-with-creator.service.ts` | Lista tasks com usuário criador |
| `listTaskAssignmentsWithUserService` | `./services/list-task-assignments-with-user.service.ts` | Lista assignments de uma task com dados do usuário |
| `addUsersToTaskService` | `./services/add-users-to-task.service.ts` | Deduplica usuários e insere assignments em massa |

---

## Repos locais

| Repo | Caminho | Responsabilidade |
|---|---|---|
| `insertOrganizationTaskAdminRepo` | `./repos/insert-organization-task.admin.repo.ts` | Insere em `organization_tasks` |
| `listOrganizationTasksWithCreatorAdminRepo` | `./repos/list-organization-tasks-with-creator.admin.repo.ts` | Lista tarefas com creator via join |
| `listTaskAssignmentsWithUserAdminRepo` | `./repos/list-task-assignments-with-user.admin.repo.ts` | Lista assignments por task |
| `insertManyTaskAssignmentsAdminRepo` | `./repos/insert-many-task-assignments.admin.repo.ts` | Insere varios assignments |

---

## Dependências externas ao módulo

### `auth`

| Import | Uso |
|---|---|
| `@/modules/auth/server/services/get-current-auth-user.service` | Autenticação dos fluxos |

### `organizations`

| Import | Uso |
|---|---|
| `@/modules/organizations/server/services/get-organization-id-by-app-domain.service` | Resolver tenant pelo host |

### `organizations/memberships`

| Import | Uso |
|---|---|
| `@/modules/organizations/memberships/server/services/is-user-member-of-organization.service` | Validar acesso básico de membro |
| `@/modules/organizations/memberships/server/services/list-organization-members-with-profile-and-role-by-organization-id.service` | Listar usuários atribuíveis |

### `shared`

| Import | Uso |
|---|---|
| `@/shared/http/get-request-host` | Resolver host atual |
| `@/shared/types/operation-response.types` | Contrato de retorno |

### `lib`

| Import | Uso |
|---|---|
| `@/lib/supabase/admin` | Persistência admin em tasks e assignments |

---

## Call Matrix

| Origem | Chama | Observações |
|---|---|---|
| `createTaskAction` | `createTaskUseCase` | Revalida após sucesso |
| `createTaskUseCase` | `createOrganizationTaskService` | Depois de auth, tenant, membership e schema |
| `getTasksForTableAction` | `getTasksForTableUseCase` | Normaliza rows para tabela |
| `getTasksForTableUseCase` | `listOrganizationTasksWithCreatorService` | Lista tasks da org |
| `getAssignableUsersAction` | `getAssignableUsersUseCase` | Normaliza membros e assigned ids |
| `getAssignableUsersUseCase` | `listOrganizationMembersWithProfileAndRoleByOrganizationIdService` | Lista membros da org |
| `getAssignableUsersUseCase` | `listTaskAssignmentsWithUserService` | Lista assignments existentes |
| `assignUsersToTaskAction` | `assignUsersToTaskUseCase` | Revalida após sucesso |
| `assignUsersToTaskUseCase` | `addUsersToTaskService` | Insere assignments deduplicados |

---

## Fluxos

### Fluxo: Create Task

1. `createTaskUseCase` autentica usuário.
2. Resolve `organizationId` pelo host.
3. Confirma membership ativa na organização.
4. Valida payload com `createOrganizationTaskSchemaServer`.
5. `createOrganizationTaskService` cria a task com `createdByUserId`.
6. Action revalida `/dashboard/task`.

### Fluxo: List Tasks

1. Autentica e resolve tenant.
2. Confirma membership.
3. `listOrganizationTasksWithCreatorService` lista tarefas com criador.
4. Action transforma para `OrganizationTaskTableRow`.

### Fluxo: Assign Users to Task

1. Valida `taskId` e `userIds`.
2. Autentica, resolve tenant e valida membership.
3. `addUsersToTaskService` deduplica `userIds` e insere assignments com role `MEMBER`.
4. Action revalida `/dashboard/task`.

---

## Comportamentos importantes

### Revalidate

`createTaskAction` e `assignUsersToTaskAction` chamam `revalidatePath("/dashboard/task")` somente após sucesso.

### Validação server-side

`createTaskUseCase` usa `createOrganizationTaskSchemaServer`; `assignUsersToTaskUseCase` e `getAssignableUsersUseCase` fazem validações básicas de `taskId`/`userIds`.

### Membership

Os fluxos de task exigem membership ativa, mas não checam permissões granulares de roles.

---

## Não usados / Atenção

Nenhum item identificado.

---

## Notas de manutencao

Atualize este arquivo quando mudar status/shape de tasks, critérios de atribuição, path de revalidate, validação server-side ou dependência com memberships.

# organizations/memberships/server

Índice da camada server-side de `organizations/memberships`.

Este arquivo serve como mapa rápido para entender entrypoints, arquivos principais, dependências e fluxos backend deste submódulo.

---

## Visao geral

Este submódulo concentra memberships, roles e permissões de organização: entrada na organização atual, listagens para tabelas/contextos, criação de cargos, sincronização de permissões e alterações de role/status de membros.

---

## Entrypoints

| Entrypoint | Arquivo | Observações |
|---|---|---|
| `joinCurrentOrganizationAction` | `./slices/join-current-organization/actions/join-current-organization.action.ts` | Entra na organização atual como `MEMBER` |
| `getOrganizationMembersForTableAction` | `./slices/get-organization-members-for-table/actions/get-organization-members-for-table.action.ts` | Lista membros para tabela legada/de rede |
| `getOrganizationUsersContextAction` | `./slices/get-organization-users-context/actions/get-organization-users-context.action.ts` | Carrega contexto de usuários da organização |
| `getOrganizationRolesContextAction` | `./slices/get-organization-roles-context/actions/get-organization-roles-context.action.ts` | Carrega contexto de cargos/permissões |
| `getCreateRoleContextAction` | `./slices/get-create-role-context/actions/get-create-role-context.action.ts` | Carrega organização e permissões disponíveis para criar cargo |
| `createRoleAction` | `./slices/create-role/actions/create-role.action.ts` | Cria cargo e revalida `/dashboard/config/roles` |
| `updateRolePermissionsAction` | `./slices/update-role-permissions/actions/update-role-permissions.action.ts` | Atualiza permissões e revalida `/dashboard/config/roles` |
| `updateMembershipRoleAction` | `./slices/update-membership-role/actions/update-membership-role.action.ts` | Atualiza role de membro e revalida network |
| `updateMembershipStatusAction` | `./slices/update-membership-status/actions/update-membership-status.action.ts` | Ativa/inativa membro e revalida network |

---

## Slices

| Slice | Caminho | Responsabilidade |
|---|---|---|
| `join-current-organization` | `./slices/join-current-organization/` | Criar membership para usuário autenticado |
| `get-organization-members-for-table` | `./slices/get-organization-members-for-table/` | Montar tabela de membros |
| `get-organization-users-context` | `./slices/get-organization-users-context/` | Montar contexto de usuários, roles e referrals |
| `get-organization-roles-context` | `./slices/get-organization-roles-context/` | Montar contexto de roles e catálogo de permissões |
| `get-create-role-context` | `./slices/get-create-role-context/` | Preparar tela/form de criação de role |
| `create-role` | `./slices/create-role/` | Criar role e vincular permissões |
| `update-role-permissions` | `./slices/update-role-permissions/` | Sincronizar permissões de role existente |
| `update-membership-role` | `./slices/update-membership-role/` | Alterar role de membro |
| `update-membership-status` | `./slices/update-membership-status/` | Ativar/inativar membership |

---

## Actions

| Action | Caminho | Observações |
|---|---|---|
| `joinCurrentOrganizationAction` | `./slices/join-current-organization/actions/join-current-organization.action.ts` | Entry point simples para join |
| `getOrganizationMembersForTableAction` | `./slices/get-organization-members-for-table/actions/get-organization-members-for-table.action.ts` | Converte membros/referrals/roles para DTO |
| `getOrganizationUsersContextAction` | `./slices/get-organization-users-context/actions/get-organization-users-context.action.ts` | Converte contexto para tabela de usuários |
| `getOrganizationRolesContextAction` | `./slices/get-organization-roles-context/actions/get-organization-roles-context.action.ts` | Retorna roles, permissions e permissões do usuário |
| `getCreateRoleContextAction` | `./slices/get-create-role-context/actions/get-create-role-context.action.ts` | Retorna organização e permissões disponíveis |
| `createRoleAction` | `./slices/create-role/actions/create-role.action.ts` | Revalida `/dashboard/config/roles` após sucesso |
| `updateRolePermissionsAction` | `./slices/update-role-permissions/actions/update-role-permissions.action.ts` | Revalida `/dashboard/config/roles` após sucesso |
| `updateMembershipRoleAction` | `./slices/update-membership-role/actions/update-membership-role.action.ts` | Revalida `/dashboard/network/my-network` após sucesso |
| `updateMembershipStatusAction` | `./slices/update-membership-status/actions/update-membership-status.action.ts` | Revalida `/dashboard/network/my-network` após sucesso |

---

## Use-cases

| Use-case | Caminho | Observações |
|---|---|---|
| `joinCurrentOrganizationUseCase` | `./slices/join-current-organization/use-cases/join-current-organization.use-case.ts` | Autentica, resolve tenant, cria membership e envia welcome email |
| `getOrganizationMembersForTableUseCase` | `./slices/get-organization-members-for-table/use-cases/get-organization-members-for-table.use-case.ts` | Carrega membros, roles, permissions e referrals |
| `getOrganizationUsersContextUseCase` | `./slices/get-organization-users-context/use-cases/get-organization-users-context.use-case.ts` | Exige permissão `users.read` e carrega usuários/roles/referrals |
| `getOrganizationRolesContextUseCase` | `./slices/get-organization-roles-context/use-cases/get-organization-roles-context.use-case.ts` | Exige permissão `org.roles.read` e carrega roles com permissões |
| `getCreateRoleContextUseCase` | `./slices/get-create-role-context/use-cases/get-create-role-context.use-case.ts` | Exige `roles.update` e filtra permissões privilegiadas |
| `createRoleUseCase` | `./slices/create-role/use-cases/create-role.use-case.ts` | Cria role, valida catálogo e sincroniza permissões |
| `updateRolePermissionsUseCase` | `./slices/update-role-permissions/use-cases/update-role-permissions.use-case.ts` | Valida role e sincroniza permissões por diff |
| `updateMembershipRoleUseCase` | `./slices/update-membership-role/use-cases/update-membership-role.use-case.ts` | Valida permissões base/privilegiadas e atualiza role |
| `updateMembershipStatusUseCase` | `./slices/update-membership-status/use-cases/update-membership-status.use-case.ts` | Valida permissões base/privilegiadas e atualiza status |

---

## Services locais

| Service | Caminho | Responsabilidade |
|---|---|---|
| `createOrganizationMembershipService` | `./services/create-membership.service.ts` | Inserir membership ativa |
| `isUserMemberOfOrganizationService` | `./services/is-user-member-of-organization.service.ts` | Checar membership ativa |
| `getMembershipByOrgAndUserIdWithRoleService` | `./services/get-membership-by-org-and-user-id-with-role.service.ts` | Buscar membership alvo com role |
| `updateMembershipByOrgAndUserIdService` | `./services/update-membership-by-org-and-user-id.service.ts` | Atualizar role/status de membership |
| `getRoleByNameService` | `./services/get-role-by-name.service.ts` | Buscar role ativa por nome |
| `listRolesByOrganizationIdService` | `./services/list-roles-by-organization-id.service.ts` | Listar roles ativas |
| `listRolesWithPermissionsByOrganizationIdService` | `./services/list-roles-with-permissions-by-organization-id.service.ts` | Listar roles com permissões |
| `createRoleService` | `./services/create-role.service.ts` | Criar role |
| `deleteRoleByIdAndOrganizationIdService` | `./services/delete-role-by-id-and-organization-id.service.ts` | Remover role em rollback/operação |
| `syncRolePermissionsService` | `./services/sync-role-permissions.service.ts` | Inserir/remover diferencas em `role_permissions` |
| `listOrganizationMembersWithProfileAndRoleByOrganizationIdService` | `./services/list-organization-members-with-profile-and-role-by-organization-id.service.ts` | Listar membros com user, profile, role e inviter |

---

## Repos locais

| Repo | Caminho | Responsabilidade |
|---|---|---|
| `insertOrganizationMembershipAdminRepo` | `./repos/insert-membership.admin.repo.ts` | Inserir membership |
| `findMembershipByOrgAndUserAdminRepo` | `./repos/find-membership-by-org-id-and-user-id.admin.repo.ts` | Checar membership por org/user |
| `getMembershipByOrgAndUserIdWithRoleAdminRepo` | `./repos/get-membership-by-org-and-user-id-with-role.admin.repo.ts` | Buscar membership com role |
| `updateMembershipByOrgAndUserIdAdminRepo` | `./repos/update-membership-by-org-and-user-id.admin.repo.ts` | Atualizar membership por org/user |
| `getRoleAdminRepo` | `./repos/get-role.admin.repo.ts` | Buscar role por nome |
| `insertRoleAdminRepo` | `./repos/insert-role.admin.repo.ts` | Criar role |
| `deleteRoleByIdAndOrganizationIdAdminRepo` | `./repos/delete-role-by-id-and-organization-id.admin.repo.ts` | Remover role |
| `listRolesByOrganizationIdAdminRepo` | `./repos/list-roles-by-organization-id.admin.repo.ts` | Listar roles ativas |
| `listRolesWithPermissionsByOrganizationIdAdminRepo` | `./repos/list-roles-with-permissions-by-organization-id.admin.repo.ts` | Listar roles com `role_permissions` |
| `listRolePermissionIdsByRoleIdAdminRepo` | `./repos/list-role-permission-ids-by-role-id.admin.repo.ts` | Listar permissão atual por role |
| `insertRolePermissionsAdminRepo` | `./repos/insert-role-permissions.admin.repo.ts` | Upsert em `role_permissions` |
| `deleteRolePermissionsAdminRepo` | `./repos/delete-role-permissions.admin.repo.ts` | Remover permissões de role |
| `listOrganizationMembersWithProfileAndRoleByOrganizationIdRepo` | `./repos/list-organization-members-with-profile-and-role-by-organization-id.repo.ts` | Listar membros com joins usando SSR client |

---

## Dependências externas ao módulo

### `auth`

| Import | Uso |
|---|---|
| `@/modules/auth/server/services/get-current-auth-user.service` | Autenticação dos use-cases |
| `@/modules/auth/server/services/has-membership-permission.service` | Verificação de permissões granulares |
| `@/modules/auth/server/services/list-membership-permissions.service` | Carregar permissões do usuário para contexto |
| `@/modules/auth/server/services/list-permissions.service` | Carregar catálogo real de permissões |
| `@/modules/auth/shared/permissions` | Constantes `PERMISSIONS` |

### `emails`

| Import | Uso |
|---|---|
| `@/modules/emails/server/services/send-welcome-email.service` | Welcome email no join da organização |

### `organizations`

| Import | Uso |
|---|---|
| `@/modules/organizations/server/services/get-organization-id-by-app-domain.service` | Resolver tenant pelo host |
| `@/modules/organizations/server/services/get-organization-by-id.service` | Carregar dados da organização |

### `organizations/referrals`

| Import | Uso |
|---|---|
| `@/modules/organizations/referrals/server/services/list-referrals-with-inviter-by-organization-id.service` | Enriquecer tabelas/contextos com dados de referral |

### `shared`

| Import | Uso |
|---|---|
| `@/shared/http/get-request-host` | Resolver host atual |
| `@/shared/infra/next/rethrow-if-next-error` | Preservar erros especiais do Next em services |
| `@/shared/types/operation-response.types` | Contrato de retorno |

### `lib`

| Import | Uso |
|---|---|
| `@/lib/supabase/admin` | Escritas admin em memberships/roles/permissões |
| `@/lib/supabase/server` | Listagem SSR de membros |

---

## Call Matrix

| Origem | Chama | Observações |
|---|---|---|
| `joinCurrentOrganizationUseCase` | `createOrganizationMembershipService` | Cria membership `MEMBER` se usuário ainda não é membro |
| `joinCurrentOrganizationUseCase` | `sendWelcomeEmailService` | Envio best-effort após join |
| `createRoleUseCase` | `createRoleService` | Cria role após auth, tenant e permissão |
| `createRoleUseCase` | `syncRolePermissionsService` | Vincula permissões; rollback remove role em falha |
| `updateRolePermissionsUseCase` | `syncRolePermissionsService` | Sincroniza diff de permissões |
| `updateMembershipRoleUseCase` | `updateMembershipByOrgAndUserIdService` | Atualiza role com regras privilegiadas |
| `updateMembershipStatusUseCase` | `updateMembershipByOrgAndUserIdService` | Atualiza `is_active` com proteção contra self-deactivate |
| `getOrganizationUsersContextUseCase` | `listOrganizationMembersWithProfileAndRoleByOrganizationIdService` | Carrega usuários/membros |
| `getOrganizationUsersContextUseCase` | `listReferralsWithInviterByOrganizationIdService` | Enriquecer origem por referral |
| `getOrganizationRolesContextUseCase` | `listRolesWithPermissionsByOrganizationIdService` | Carrega roles com permissões |

---

## Fluxos

### Fluxo: Join Current Organization

1. Autentica usuário atual.
2. Resolve host e `organizationId`.
3. Verifica se já é membro.
4. Busca role `MEMBER`.
5. Cria membership se necessário.
6. Busca organização e envia welcome email best-effort.

### Fluxo: Create Role

1. Autentica usuário, resolve tenant e verifica `PERMISSIONS.ROLES_UPDATE`.
2. Normaliza nome e permission keys.
3. Remove permissões com sufixo `.privileged`.
4. Valida catálogo real de permissões.
5. Cria role não sistêmica e ativa.
6. Sincroniza permissões; se falhar, tenta rollback removendo a role criada.
7. Action revalida `/dashboard/config/roles`.

### Fluxo: Update Role Permissions

1. Autentica, resolve tenant e verifica `PERMISSIONS.ROLES_UPDATE`.
2. Valida role selecionada na organização.
3. Bloqueia edição de `OWNER`.
4. Exige que editor seja `OWNER` para editar role `ADMIN`.
5. Bloqueia permission keys com `.privileged`.
6. Valida catálogo e sincroniza `role_permissions` por diff.
7. Action revalida `/dashboard/config/roles`.

### Fluxo: Update Membership Role/Status

1. Autentica e resolve tenant.
2. Verifica permissões base e privilegiadas.
3. Carrega membership alvo com role.
4. Aplica regras para roles `OWNER`/`ADMIN`.
5. Atualiza `role_id` ou `is_active`.
6. Status não permite inativar a si mesmo.
7. Actions revalidam `/dashboard/network/my-network`.

---

## Comportamentos importantes

### Permissões privilegiadas

Fluxos de role/status diferenciam permissões base e privilegiadas. Roles `OWNER`/`ADMIN` possuem proteções extras.

### Rollback

`createRoleUseCase` tenta remover a role criada se a sincronização inicial de permissões falhar.

### Sync insert-before-delete

`syncRolePermissionsService` insere permissões antes de remover para reduzir risco de role ficar sem permissões em falha parcial.

### Revalidate

Actions de roles revalidam `/dashboard/config/roles`; actions de membership revalidam `/dashboard/network/my-network` somente após sucesso.

### Self-protection

`updateMembershipStatusUseCase` bloqueia inativar o próprio usuário.

---

## Não usados / Atenção

| Item | Motivo | Recomendacao |
|---|---|---|
| `src/modules/organizations/memberships/server/README.md` | Índice legado; não cobre roles, permissões e novos slices atuais | Manter apenas como legado temporário ou migrar/remover em tarefa própria |

---

## Notas de manutencao

Atualize este arquivo quando mudar roles, permission keys, regras privilegiadas, revalidate paths, listagens de membros, join de organização ou repos de `role_permissions`.

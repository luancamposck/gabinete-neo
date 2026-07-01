# auth/server

Índice da camada server-side de `auth`.

Este arquivo serve como mapa rápido para entender entrypoints, arquivos principais, dependências e fluxos backend deste módulo.

---

## Visao geral

Este módulo concentra autenticação Supabase, sessão do usuário atual, sign-in/out, sign-up admin, reset/update de senha, guard de dashboard e verificação/listagem de permissões de membership.

---

## Entrypoints

| Entrypoint | Arquivo | Observações |
|---|---|---|
| `signInAction` | `./slices/sign-in/actions/sign-in.action.ts` | Valida `signInSchema` e autentica |
| `signOutAction` | `./slices/sign-out/actions/sign-out.action.ts` | Encerra sessão e revalida layout |
| `getCurrentUserAction` | `./slices/get-current-user/actions/get-current-user.action.ts` | Retorna usuário autenticado |
| `requestPasswordResetAction` | `./slices/request-password-reset/actions/request-password-reset.action.ts` | Valida e-mail e solicita reset |
| `updatePasswordAction` | `./slices/update-password/actions/update-password.action.ts` | Valida senha/confirmação e atualiza senha |
| `requireDashboardAccessAction` | `./slices/dashboard-guard/actions/require-dashboard-access.action.ts` | Valida acesso ao dashboard da organização atual |

---

## Slices

| Slice | Caminho | Responsabilidade |
|---|---|---|
| `sign-in` | `./slices/sign-in/` | Login por e-mail/senha |
| `sign-out` | `./slices/sign-out/` | Logout |
| `get-current-user` | `./slices/get-current-user/` | Usuário auth atual |
| `request-password-reset` | `./slices/request-password-reset/` | Solicitar reset de senha |
| `update-password` | `./slices/update-password/` | Atualizar senha |
| `dashboard-guard` | `./slices/dashboard-guard/` | Guard server-side para dashboard |

---

## Actions

| Action | Caminho | Observações |
|---|---|---|
| `signInAction` | `./slices/sign-in/actions/sign-in.action.ts` | Recebe `unknown` e valida schema compartilhado |
| `signOutAction` | `./slices/sign-out/actions/sign-out.action.ts` | Chama `revalidatePath("/", "layout")` após service |
| `getCurrentUserAction` | `./slices/get-current-user/actions/get-current-user.action.ts` | Chama service diretamente |
| `requestPasswordResetAction` | `./slices/request-password-reset/actions/request-password-reset.action.ts` | Usa schema de onboarding |
| `updatePasswordAction` | `./slices/update-password/actions/update-password.action.ts` | Schema local exige senha mínima e confirmação |
| `requireDashboardAccessAction` | `./slices/dashboard-guard/actions/require-dashboard-access.action.ts` | Chama use-case de guard |

---

## Use-cases

| Use-case | Caminho | Observações |
|---|---|---|
| `requireDashboardAccessUseCase` | `./slices/dashboard-guard/use-cases/require-dashboard-access.use-case.ts` | Autentica, resolve tenant por host e exige membership |

---

## Services locais

| Service | Caminho | Responsabilidade |
|---|---|---|
| `signInService` | `./services/sign-in.service.ts` | Supabase sign-in por senha |
| `signUpService` | `./services/sign-up.service.ts` | Criar auth user via Admin |
| `signOutService` | `./services/sign-out.service.ts` | Encerrar sessão |
| `getCurrentAuthUserService` | `./services/get-current-auth-user.service.ts` | Obter usuário auth atual e mapear sessão ausente |
| `deleteAuthUserService` | `./services/delete-auth-user.service.ts` | Remover auth user via Admin |
| `requestPasswordResetService` | `./services/request-password-reset.service.ts` | Solicitar reset de senha |
| `updatePasswordService` | `./services/update-password.service.ts` | Atualizar senha do usuário atual |
| `hasMembershipPermissionService` | `./services/has-membership-permission.service.ts` | Chamar RPC `has_membership_permission` |
| `listMembershipPermissionsService` | `./services/list-membership-permissions.service.ts` | Chamar RPC `list_membership_permissions` e filtrar keys válidas |
| `listPermissionsService` | `./services/list-permissions.service.ts` | Listar catálogo de permissões via Admin |

---

## Repos locais

| Repo | Caminho | Responsabilidade |
|---|---|---|
| `insertAuthUserAdminRepo` | `./repos/auth.admin.repo.ts` | Criar usuário auth confirmado |
| `signInRepo` | `./repos/auth.repo.ts` | Supabase `signInWithPassword` |
| `deleteUserByIdAdminRepo` | `./repos/delete-user-by-id.admin.repo.ts` | Admin delete user |
| `getCurrentAuthUserRepo` | `./repos/get-user.repo.ts` | Supabase `auth.getUser` |
| `signOutRepo` | `./repos/sign-out.repo.ts` | Supabase `auth.signOut` |
| `requestPasswordResetRepo` | `./repos/request-password-reset.repo.ts` | Supabase reset password e-mail |
| `updatePasswordRepo` | `./repos/update-password.repo.ts` | Supabase `auth.updateUser` |
| `existsPermissionForMembershipRepo` | `./repos/exists-permission-for-membership.repo.ts` | RPC `has_membership_permission` |
| `listMembershipPermissionsRepo` | `./repos/list-membership-permissions.repo.ts` | RPC `list_membership_permissions` |
| `listPermissionsAdminRepo` | `./repos/list-permissions.admin.repo.ts` | Listar `permissions` |

---

## Dependências externas ao módulo

### `accounts/onboarding`

| Import | Uso |
|---|---|
| `@/modules/accounts/onboarding/shared/validations/forgot-password.schema` | Schema do reset de senha |

### `organizations`

| Import | Uso |
|---|---|
| `@/modules/organizations/server/services/get-organization-id-by-app-domain.service` | Resolver tenant no guard |

### `organizations/memberships`

| Import | Uso |
|---|---|
| `@/modules/organizations/memberships/server/services/is-user-member-of-organization.service` | Validar acesso ao dashboard |

### `shared`

| Import | Uso |
|---|---|
| `@/shared/http/get-request-host` | Resolver host no guard |
| `@/shared/infra/next/rethrow-if-next-error` | Preservar erros especiais do Next |
| `@/shared/types/operation-response.types` | Contrato de retorno |

### `lib`

| Import | Uso |
|---|---|
| `@/lib/supabase/admin` | Operações admin de Auth e permissões |
| `@/lib/supabase/server` | Operações auth/session/RPC do usuário atual |

---

## Call Matrix

| Origem | Chama | Observações |
|---|---|---|
| `signInAction` | `signInService` | Valida `signInSchema` |
| `signInService` | `signInRepo` | Mapeia `invalid_credentials` |
| `signUpService` | `insertAuthUserAdminRepo` | Mapeia `email_exists` |
| `signOutAction` | `signOutService` | Revalida layout após chamada |
| `getCurrentAuthUserService` | `getCurrentAuthUserRepo` | `AuthSessionMissingError` vira `unauthenticated` |
| `requireDashboardAccessUseCase` | `getCurrentAuthUserService` | Exige usuário logado |
| `requireDashboardAccessUseCase` | `getOrganizationIdByAppDomainService` | Resolve tenant |
| `requireDashboardAccessUseCase` | `isUserMemberOfOrganizationService` | Exige membership ativa |
| `hasMembershipPermissionService` | `existsPermissionForMembershipRepo` | RPC de permissão |
| `listMembershipPermissionsService` | `listMembershipPermissionsRepo` | RPC de lista de permissões |

---

## Fluxos

### Fluxo: Sign In

1. `signInAction` valida e-mail/senha.
2. `signInService` chama `signInRepo`.
3. Credenciais inválidas retornam mensagem específica.

### Fluxo: Dashboard Guard

1. `requireDashboardAccessUseCase` obtém usuário autenticado.
2. Resolve host e `organizationId`.
3. Verifica membership ativa na organização.
4. Retorna `host`, `organizationId` e `userId` se permitido.

### Fluxo: Permissions

1. `hasMembershipPermissionService` chama RPC booleana para uma permission key.
2. `listMembershipPermissionsService` chama RPC de lista e filtra keys contra `PERMISSIONS`.
3. `listPermissionsService` lista catálogo admin de permissões.

---

## Comportamentos importantes

### Sessão ausente

`getCurrentAuthUserService` trata `AuthSessionMissingError` e mensagem `Auth session missing!` como `unauthenticated`, não como infra.

### Admin Auth

`signUpService` cria usuário com `email_confirm: true`; `deleteAuthUserService` é usado por rollback de onboarding.

### RPCs de permissão

`existsPermissionForMembershipRepo` e `listMembershipPermissionsRepo` dependem das RPCs `has_membership_permission` e `list_membership_permissions`.

### Revalidate

`signOutAction` revalida o layout raiz após sign-out.

---

## Não usados / Atenção

| Item | Motivo | Recomendacao |
|---|---|---|
| `src/modules/auth/server/README.md` | Índice legado; não cobre reset/update password, guard e permissões atuais | Manter apenas como legado temporário ou migrar/remover em tarefa própria |
| `requestPasswordResetAction` | Contém `console.log(formData)` | Revisar em tarefa própria se esse log deve ser removido |

---

## Notas de manutencao

Atualize este arquivo quando mudar auth/session, RPCs de permissão, guard de dashboard, reset/update de senha, rollback de auth user ou uso de Supabase Admin.

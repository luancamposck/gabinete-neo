# app-shell/server

Índice da camada server-side de `app-shell`.

Este arquivo serve como mapa rápido para entender entrypoints, arquivos principais, dependências e fluxos backend deste módulo.

---

## Visao geral

Este módulo carrega contexto server-side para o shell do app, especialmente dados do usuário e permissões de membership usados por navegação/sidebar.

---

## Entrypoints

| Entrypoint | Arquivo | Observações |
|---|---|---|
| `getSidebarContextAction` | `./slices/get-sidebar-context/actions/get-sidebar-context.action.ts` | Carrega usuário e permission keys para o shell |

---

## Slices

| Slice | Caminho | Responsabilidade |
|---|---|---|
| `get-sidebar-context` | `./slices/get-sidebar-context/` | Contexto de sidebar/navegação |

---

## Actions

| Action | Caminho | Observações |
|---|---|---|
| `getSidebarContextAction` | `./slices/get-sidebar-context/actions/get-sidebar-context.action.ts` | Chama use-case diretamente |

---

## Use-cases

| Use-case | Caminho | Observações |
|---|---|---|
| `getSidebarContextUseCase` | `./slices/get-sidebar-context/use-cases/get-sidebar-context.use-case.ts` | Autentica, resolve tenant, lista permissões e busca usuário |

---

## Services locais

Nenhum service local.

---

## Repos locais

Nenhum repo local.

---

## Dependências externas ao módulo

### `accounts/users`

| Import | Uso |
|---|---|
| `@/modules/accounts/users/server/services/get-user-by-id.service` | Obter nome/email/username do usuário |

### `auth`

| Import | Uso |
|---|---|
| `@/modules/auth/server/services/get-current-auth-user.service` | Autenticação |
| `@/modules/auth/server/services/list-membership-permissions.service` | Permission keys da membership atual |

### `organizations`

| Import | Uso |
|---|---|
| `@/modules/organizations/server/services/get-organization-id-by-app-domain.service` | Resolver tenant |

### `shared`

| Import | Uso |
|---|---|
| `@/shared/http/get-request-host` | Resolver host |
| `@/shared/types/operation-response.types` | Contrato de retorno |

---

## Call Matrix

| Origem | Chama | Observações |
|---|---|---|
| `getSidebarContextAction` | `getSidebarContextUseCase` | Entry point |
| `getSidebarContextUseCase` | `getCurrentAuthUserService` | Retorna `unauthenticated` sem sessão |
| `getSidebarContextUseCase` | `getOrganizationIdByAppDomainService` | Resolve tenant pelo host |
| `getSidebarContextUseCase` | `listMembershipPermissionsService` | Carrega permission keys |
| `getSidebarContextUseCase` | `getUserByIdService` | Carrega dados básicos do usuário |

---

## Fluxos

### Fluxo: Sidebar Context

1. Autentica usuário.
2. Resolve host e `organizationId`.
3. Lista permissões da membership do usuário.
4. Busca dados do usuário.
5. Retorna `user` e `permissionKeys`.

---

## Comportamentos importantes

### Shell auth boundary

Falha de autenticação retorna `unauthenticated`; falhas técnicas caem em `infra_error`.

### Permission keys

As permissões retornadas alimentam controle de UI/navegação, mas a autorização final deve continuar no server dos fluxos sensíveis.

---

## Não usados / Atenção

Nenhum item identificado.

---

## Notas de manutencao

Atualize este arquivo quando mudar contexto de sidebar, dependências de permissão ou shape retornado para o app shell.

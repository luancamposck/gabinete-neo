# accounts/server

Índice da camada server-side de `accounts`.

Este arquivo serve como mapa rápido para entender entrypoints, arquivos principais, dependências e fluxos backend deste módulo.

---

## Visao geral

Este módulo raiz agrega dados da conta do usuário autenticado para o dashboard, combinando usuário com perfil e organização atual com membership.

---

## Entrypoints

| Entrypoint | Arquivo | Observações |
|---|---|---|
| `getMyAccountDataAction` | `./slices/my-account/actions/get-my-account-data.action.ts` | Carrega dados de conta e converte para DTOs do client |

---

## Slices

| Slice | Caminho | Responsabilidade |
|---|---|---|
| `my-account` | `./slices/my-account/` | Dados da conta do usuário e organização atual |

---

## Actions

| Action | Caminho | Observações |
|---|---|---|
| `getMyAccountDataAction` | `./slices/my-account/actions/get-my-account-data.action.ts` | Converte `UserWithProfileView` e `OrganizationWithMembershipView` para DTOs camelCase |

---

## Use-cases

| Use-case | Caminho | Observações |
|---|---|---|
| `getMyAccountDataUseCase` | `./slices/my-account/use-cases/get-my-account-data.use-case.ts` | Autentica, busca user/profile, resolve tenant e busca org/membership |

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
| `@/modules/accounts/users/server/services/get-user-with-profile.service` | Carregar usuário com perfil |

### `auth`

| Import | Uso |
|---|---|
| `@/modules/auth/server/services/get-current-auth-user.service` | Resolver usuário autenticado |

### `organizations`

| Import | Uso |
|---|---|
| `@/modules/organizations/server/services/get-organization-id-by-app-domain.service` | Resolver tenant pelo host |
| `@/modules/organizations/server/services/get-organization-with-membership.service` | Carregar organização com membership do usuário |

### `shared`

| Import | Uso |
|---|---|
| `@/shared/http/get-request-host` | Resolver host atual |
| `@/shared/types/operation-response.types` | Contrato de retorno |

---

## Call Matrix

| Origem | Chama | Observações |
|---|---|---|
| `getMyAccountDataAction` | `getMyAccountDataUseCase` | Depois converte views para DTOs |
| `getMyAccountDataUseCase` | `getCurrentAuthUserService` | Retorna `unauthenticated` sem sessão |
| `getMyAccountDataUseCase` | `getUserWithProfileService` | Retorna `user_not_found` se usuário público/perfil ausente |
| `getMyAccountDataUseCase` | `getRequestHost` | Host ausente vira `org_not_found` |
| `getMyAccountDataUseCase` | `getOrganizationIdByAppDomainService` | Resolve tenant |
| `getMyAccountDataUseCase` | `getOrganizationWithMemberhipService` | Busca organização com membership |

---

## Fluxos

### Fluxo: My Account Data

1. `getMyAccountDataAction` chama o use-case.
2. `getMyAccountDataUseCase` obtém usuário autenticado.
3. Busca usuário com perfil.
4. Resolve host e `organizationId`.
5. Busca organização com membership do usuário.
6. Action converte dados para DTOs usados pelo client.

---

## Comportamentos importantes

### DTO boundary

A action normaliza campos para DTOs, incluindo `address` e `membership`, evitando expor diretamente o shape cru dos joins.

### Tenant por host

O use-case depende do host atual para resolver a organização.

---

## Não usados / Atenção

Nenhum item identificado.

---

## Notas de manutencao

Atualize este arquivo quando mudar DTO de conta, dependências com usuários/organizações ou regra de resolução de tenant.

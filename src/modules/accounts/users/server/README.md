# accounts/users/server

Este diretorio contem a camada server-side do modulo **accounts/users**.

## Regras rapidas (dependencias)
- `actions` chamam `use-cases` (ou `services` em casos simples)
- `use-cases` orquestram `services`
- `services` chamam `repos`
- `repos` so acessam o banco/infra
- Services nao chamam outras services (orquestracao fica no use-case)

---

## Indice
- [Slices](#slices)
- [Actions](#actions)
- [Use-cases](#use-cases)
- [Services](#services)
- [Repos](#repos)
- [Call Matrix](#call-matrix)
- [Fluxos](#fluxos)
- [Nao usados](#nao-usados)

---

## Slices
- (nenhum)

## Actions
- (nenhum)

## Use-cases
- (nenhum)

## Services
- `get-user-id-by-username.service` - `./services/get-user-id-by-username.service.ts`
- `get-username-by-user-id.service` - `./services/get-username-by-user-id.service.ts`

## Repos
- `find-user-id-by-username.admin.repo` - `./repos/find-user-id-by-username.admin.repo.ts`
- `find-username-by-user-id.admin.repo` - `./repos/find-username-by-user-id.admin.repo.ts`
- `insert-user.admin.repo` - `./repos/insert-user.admin.repo.ts`

## Call Matrix

| Entry point | Chama | Observacoes |
|---|---|---|
| `getUserIdByUsernameService` | `findUserIdByUsernameAdminRepo` | normaliza `username` |
| `getUsernameByUserIdService` | `findUsernameByUserIdAdminRepo` | busca `username` |
| `registerAndJoinUseCase` | `getUserIdByUsernameService` | valida ref |
| `getMyReferralLinkUseCase` | `getUsernameByUserIdService` | modulo organizations/referrals |

## Fluxos

### Fluxo: Get User Id by Username
1) `getUserIdByUsernameService(username)`
2) `findUserIdByUsernameAdminRepo`

### Fluxo: Get Username by User Id
1) `getUsernameByUserIdService(userId)`
2) `findUsernameByUserIdAdminRepo`

## Nao usados
- Itens sem referencia direta via import (relative ou `@/`).
- (nenhum)

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
- `create-user.service` - `./services/create-user.service.ts`
- `get-user-id-by-invite-code.service` - `./services/get-user-id-by-invite-code.service.ts`
- `get-user-invite-code-by-user-id.service` - `./services/get-user-invite-code-by-user-id.service.ts`

## Repos
- `find-user-id-by-invite-code.admin.repo` - `./repos/find-user-id-by-invite-code.admin.repo.ts`
- `find-user-invite-code-by-user-id.admin.repo` - `./repos/find-user-invite-code-by-user-id.admin.repo.ts`
- `insert-user.admin.repo` - `./repos/insert-user.admin.repo.ts`

## Call Matrix

| Entry point | Chama | Observacoes |
|---|---|---|
| `createUserService` | `insertUserAdminRepo` | gera `invite_code` antes do insert |
| `getUserIdByInviteCodeService` | `findUserIdByInviteCodeAdminRepo` | normaliza `inviteCode` |
| `getUserInviteCodeByUserIdService` | `findUserInviteCodeByUserIdAdminRepo` | busca `invite_code` |
| `registerAndJoinUseCase` | `createUserService` | modulo accounts/onboarding |
| `registerAndJoinUseCase` | `getUserIdByInviteCodeService` | valida ref |
| `getMyReferralLinkUseCase` | `getUserInviteCodeByUserIdService` | modulo organizations/referrals |

## Fluxos

### Fluxo: Create User
1) `createUserService(params)`
2) `insertUserAdminRepo` (insere em `users` com `invite_code`)

### Fluxo: Get User Id by Invite Code
1) `getUserIdByInviteCodeService(inviteCode)`
2) `findUserIdByInviteCodeAdminRepo`

### Fluxo: Get Invite Code by User Id
1) `getUserInviteCodeByUserIdService(userId)`
2) `findUserInviteCodeByUserIdAdminRepo`

## Nao usados
- Itens sem referencia direta via import (relative ou `@/`).
- (nenhum)

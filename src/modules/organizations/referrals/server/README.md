# organizations/referrals/server

Este diretorio contem a camada server-side do modulo **organizations/referrals**.

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
- `get-my-referral-link` - `./slices/get-my-referral-link/`

## Actions
- `get-my-referral-link.action` - `./slices/get-my-referral-link/actions/get-my-referral-link.action.ts`

## Use-cases
- `get-my-referral-link.use-case` - `./slices/get-my-referral-link/use-cases/get-my-referral-link.use-case.ts`

## Services
- `create-referral.service` - `./services/create-referral.service.ts`

## Repos
- `insert-referral.admin.repo` - `./repos/insert-referral.admin.repo.ts`

## Call Matrix

| Entry point | Chama | Observacoes |
|---|---|---|
| `getMyReferralLinkAction` | `getMyReferralLinkUseCase` | server action |
| `getMyReferralLinkUseCase` | `getRequestHost` | resolve host/app_domain |
| `getMyReferralLinkUseCase` | `getOrganizationIdByAppDomainService` | resolve organizationId |
| `getMyReferralLinkUseCase` | `getCurrentAuthUserService` | usuario logado |
| `getMyReferralLinkUseCase` | `isUserMemberOfOrganizationService` | valida membership |
| `getMyReferralLinkUseCase` | `getUserInviteCodeByUserIdService` | recupera invite_code |
| `createOrganizationReferralService` | `insertOrganizationReferralAdminRepo` | cria referral |
| `registerAndJoinUseCase` | `createOrganizationReferralService` | modulo accounts/onboarding |

## Fluxos

### Fluxo: Get My Referral Link
1) `getRequestHost()`
2) `getOrganizationIdByAppDomainService(appDomain)`
3) `getCurrentAuthUserService()`
4) `isUserMemberOfOrganizationService(organizationId, userId)`
5) `getUserInviteCodeByUserIdService(userId)`
6) Monta `referralUrl` com `https://{host}/?ref={inviteCode}`

### Fluxo: Create Referral (service)
1) `createOrganizationReferralService(params)`
2) `insertOrganizationReferralAdminRepo`

## Nao usados
- Itens sem referencia direta via import (relative ou `@/`).
- (nenhum)

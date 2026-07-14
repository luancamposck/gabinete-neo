# organizations/memberships/server

Este diretorio contem a camada server-side do modulo **organizations/memberships**.

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
- `create-membership.service` - `./services/create-membership.service.ts`
- `is-user-member-of-organization.service` - `./services/is-user-member-of-organization.service.ts`

## Repos
- `find-membership-by-org-id-and-user-id.admin.repo` - `./repos/find-membership-by-org-id-and-user-id.admin.repo.ts`
- `insert-membership.admin.repo` - `./repos/insert-membership.admin.repo.ts`

## Call Matrix

| Entry point | Chama | Observacoes |
|---|---|---|
| `createOrganizationMembershipService` | `insertOrganizationMembershipAdminRepo` | insere em `memberships` |
| `isUserMemberOfOrganizationService` | `findMembershipByOrgAndUserAdminRepo` | retorna isMember/isActive |
| `registerAndJoinUseCase` | `createOrganizationMembershipService` | modulo accounts/onboarding |
| `registerAndJoinUseCase` | `isUserMemberOfOrganizationService` | valida ref |
| `getMyReferralLinkUseCase` | `isUserMemberOfOrganizationService` | modulo organizations/referrals |

## Fluxos

### Fluxo: Create Membership
1) `createOrganizationMembershipService(params)`
2) `insertOrganizationMembershipAdminRepo`

### Fluxo: Check Membership
1) `isUserMemberOfOrganizationService(organizationId, userId)`
2) `findMembershipByOrgAndUserAdminRepo`

## Nao usados
- Itens sem referencia direta via import (relative ou `@/`).
- (nenhum)

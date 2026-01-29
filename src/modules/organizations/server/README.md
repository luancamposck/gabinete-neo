# organizations/server

Este diretorio contem a camada server-side do modulo **organizations**.

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
- `get-organization-id-by-app-domain.service` - `./services/get-organization-id-by-app-domain.service.ts`

## Repos
- `find-organization-id-by-app-domain.admin.repo` - `./repos/find-organization-id-by-app-domain.admin.repo.ts`

## Call Matrix

| Entry point | Chama | Observacoes |
|---|---|---|
| `getOrganizationIdByAppDomainService` | `findOrganizationIdByAppDomainAdminRepo` | lookup por `app_domain` |
| `registerAndJoinUseCase` | `getOrganizationIdByAppDomainService` | modulo accounts/onboarding |
| `getMyReferralLinkUseCase` | `getOrganizationIdByAppDomainService` | modulo organizations/referrals |

## Fluxos

### Fluxo: Get Organization Id by App Domain
1) `getOrganizationIdByAppDomainService(appDomain)`
2) `findOrganizationIdByAppDomainAdminRepo`

## Nao usados
- Itens sem referencia direta via import (relative ou `@/`).
- (nenhum)

# accounts/onboarding/server

Este diretorio contem a camada server-side do modulo **accounts/onboarding**.

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
- `register-and-join` - `./slices/register-and-join/`

## Actions
- `register-and-join.action` - `./slices/register-and-join/actions/register-and-join.action.ts`

## Use-cases
- `register-and-join.use-case` - `./slices/register-and-join/use-cases/register-and-join.use-case.ts`

## Services
- (nenhum)

## Repos
- (nenhum)

## Call Matrix

| Entry point | Chama | Observacoes |
|---|---|---|
| `registerAndJoinAction` | `registerAndJoinUseCase` | valida `registerAndJoinSchemaServer` |
| `registerAndJoinUseCase` | `getRequestHost` | resolve host/app_domain |
| `registerAndJoinUseCase` | `getOrganizationIdByAppDomainService` | resolve organizationId |
| `registerAndJoinUseCase` | `getUserIdByUsernameService` | somente se `ref` informado |
| `registerAndJoinUseCase` | `isUserMemberOfOrganizationService` | valida se o inviter pertence a org |
| `registerAndJoinUseCase` | `signUpService` | cria usuario no auth |
| `registerAndJoinUseCase` | `createUserService` | cria `public.users` |
| `registerAndJoinUseCase` | `createUserProfileService` | cria `user_profiles` |
| `registerAndJoinUseCase` | `createOrganizationMembershipService` | cria membership |
| `registerAndJoinUseCase` | `createOrganizationReferralService` | opcional, se `ref` valido |
| `registerAndJoinUseCase` | `deleteAuthUserService` | rollback em falhas pos-signUp |

## Fluxos

### Fluxo: Register and Join
1) `getRequestHost()`
2) `getOrganizationIdByAppDomainService(appDomain)`
3) Se `ref` informado: `getUserIdByUsernameService` + `isUserMemberOfOrganizationService`
4) `signUpService(email, password)`
5) `createUserService(id, email, name, username)`
6) `createUserProfileService(userId, address, phone...)`
7) `createOrganizationMembershipService(organizationId, userId, invitedByUserId?)`
8) `createOrganizationReferralService(...)` *(opcional)*
9) Em falhas apos `signUpService`, executa `deleteAuthUserService` como rollback

## Nao usados
- Itens sem referencia direta via import (relative ou `@/`).
- (nenhum)

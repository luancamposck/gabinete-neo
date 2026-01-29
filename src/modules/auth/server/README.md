# auth/server

Este diretorio contem a camada server-side do modulo **auth**.

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
- `sign-in` - `./slices/sign-in/`

## Actions
- `sign-in.action` - `./slices/sign-in/actions/sign-in.action.ts`

## Use-cases
- (nenhum)

## Services
- `delete-auth-user.service` - `./services/delete-auth-user.service.ts`
- `get-current-auth-user.service` - `./services/get-current-auth-user.service.ts`
- `sign-in.service` - `./services/sign-in.service.ts`
- `sign-up.service` - `./services/sign-up.service.ts`

## Repos
- `auth.admin.repo` - `./repos/auth.admin.repo.ts`
- `auth.repo` - `./repos/auth.repo.ts`
- `delete-user-by-id.admin.repo` - `./repos/delete-user-by-id.admin.repo.ts`
- `get-user.repo` - `./repos/get-user.repo.ts`

## Call Matrix

| Entry point | Chama | Observacoes |
|---|---|---|
| `signInAction` | `signInService` | valida `signInSchema` |
| `signInService` | `signInRepo` | supabase auth signInWithPassword |
| `signUpService` | `insertAuthUserAdminRepo` | admin createUser |
| `getCurrentAuthUserService` | `getCurrentAuthUserRepo` | supabase auth getUser |
| `deleteAuthUserService` | `deleteUserByIdAdminRepo` | supabase admin deleteUser |
| `registerAndJoinUseCase` | `signUpService` | modulo accounts/onboarding |
| `registerAndJoinUseCase` | `deleteAuthUserService` | rollback em falhas pos-signUp |
| `getMyReferralLinkUseCase` | `getCurrentAuthUserService` | modulo organizations/referrals |

## Fluxos

### Fluxo: Sign In
1) `signInAction(formData)`
2) `signInService(email, password)`
3) `signInRepo` (Supabase Auth)

### Fluxo: Sign Up (service)
1) `signUpService(email, password)`
2) `insertAuthUserAdminRepo` (Supabase Admin)

### Fluxo: Get Current Auth User
1) `getCurrentAuthUserService()`
2) `getCurrentAuthUserRepo`

### Fluxo: Delete Auth User
1) `deleteAuthUserService({ userId })`
2) `deleteUserByIdAdminRepo`

## Nao usados
- Itens sem referencia direta via import (relative ou `@/`).
- (nenhum)

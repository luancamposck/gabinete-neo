# accounts/users/server

Índice da camada server-side de `accounts/users`.

Este arquivo serve como mapa rápido para entender entrypoints, arquivos principais, dependências e fluxos backend deste submódulo.

---

## Visao geral

Este submódulo concentra buscas em `public.users`, carregamento com perfil e atualização de username do usuário autenticado. A criação inicial ocorre atomicamente pela trigger do fluxo de Auth.

---

## Entrypoints

| Entrypoint | Arquivo | Observações |
|---|---|---|
| `editUsernameAction` | `./slices/edit-username/actions/edit-username.action.ts` | Valida username e chama use-case |
| `getUserByIdService` | `./services/get-user-by-id.service.ts` | Usado por app-shell |
| `getUserWithProfileService` | `./services/get-user-with-profile.service.ts` | Usado por accounts raiz |
| `getUserIdByUsernameService` | `./services/get-user-id-by-username.service.ts` | Usado por onboarding/referral |
| `getUsernameByUserIdService` | `./services/get-username-by-user-id.service.ts` | Usado por referrals |

---

## Slices

| Slice | Caminho | Responsabilidade |
|---|---|---|
| `edit-username` | `./slices/edit-username/` | Atualizar username do usuário autenticado |

---

## Actions

| Action | Caminho | Observações |
|---|---|---|
| `editUsernameAction` | `./slices/edit-username/actions/edit-username.action.ts` | Schema local exige username de 2 a 32 caracteres |

---

## Use-cases

| Use-case | Caminho | Observações |
|---|---|---|
| `editUsernameUseCase` | `./slices/edit-username/use-cases/edit-username.use-case.ts` | Exige usuário autenticado e chama service de update |

---

## Services locais

| Service | Caminho | Responsabilidade |
|---|---|---|
| `getUserByIdService` | `./services/get-user-by-id.service.ts` | Busca usuário por id via SSR client |
| `getUserWithProfileService` | `./services/get-user-with-profile.service.ts` | Busca usuário com `user_profiles` |
| `getUserIdByUsernameService` | `./services/get-user-id-by-username.service.ts` | Normaliza username e busca id via admin repo |
| `getUsernameByUserIdService` | `./services/get-username-by-user-id.service.ts` | Busca username por userId via admin repo |
| `updateUsernameService` | `./services/update-username.service.ts` | Normaliza e atualiza username |

---

## Repos locais

| Repo | Caminho | Responsabilidade |
|---|---|---|
| `findUserByIdRepo` | `./repos/find-user-by-id.repo.ts` | Busca usuário por id com SSR client |
| `findUserWithProfileRepo` | `./repos/find-user-with-profile.repo.ts` | Busca usuário com perfil via join |
| `findUserIdByUsernameAdminRepo` | `./repos/find-user-id-by-username.admin.repo.ts` | Busca id por username com Admin |
| `findUsernameByUserIdAdminRepo` | `./repos/find-username-by-user-id.admin.repo.ts` | Busca username por userId com Admin |
| `insertUserAdminRepo` | `./repos/insert-user.admin.repo.ts` | Insere em `users` com Admin |
| `updateUserRepo` | `./repos/update-user.repo.ts` | Atualiza `users` com SSR client |

---

## Dependências externas ao módulo

### `auth`

| Import | Uso |
|---|---|
| `@/modules/auth/server/services/get-current-auth-user.service` | Resolver usuário autenticado no fluxo de username |

### `shared`

| Import | Uso |
|---|---|
| `@/shared/types/operation-response.types` | Contrato de retorno |

### `lib`

| Import | Uso |
|---|---|
| `@/lib/supabase/admin` | Criação/buscas admin de usuários |
| `@/lib/supabase/server` | Buscas e updates SSR |

---

## Call Matrix

| Origem | Chama | Observações |
|---|---|---|
| `editUsernameAction` | `editUsernameUseCase` | Depois de validar username |
| `editUsernameUseCase` | `getCurrentAuthUserService` | Exige sessão |
| `editUsernameUseCase` | `updateUsernameService` | Atualiza username do usuário atual |
| `updateUsernameService` | `updateUserRepo` | Normaliza username para lowercase |
| `getUserIdByUsernameService` | `findUserIdByUsernameAdminRepo` | Usado para resolver `ref` |
| `getUsernameByUserIdService` | `findUsernameByUserIdAdminRepo` | Usado para gerar link referral |
| `getUserWithProfileService` | `findUserWithProfileRepo` | Usado em dados de conta |

---

## Fluxos

### Fluxo: Edit Username

1. `editUsernameAction` valida payload.
2. `editUsernameUseCase` obtém usuário autenticado.
3. `updateUsernameService` normaliza username com `trim().toLowerCase()`.
4. `updateUserRepo` atualiza `users`.
5. Erro `23505` vira `username_already_exists`.

### Fluxo: Lookup de username/referral

1. `getUserIdByUsernameService` normaliza username e busca `id`.
2. `getUsernameByUserIdService` busca username por `userId`.
3. Esses services apoiam onboarding e referrals.

---

## Comportamentos importantes

### Normalizacao de username

`getUserIdByUsernameService` e `updateUsernameService` aplicam `trim().toLowerCase()`. Mudar isso pode afetar referrals e unicidade.

### Unicidade

O update de username trata erro `23505` como conflito de username.

### Infra/Admin

Lookups por username usam Admin; busca por id/profile e update usam SSR client.

---

## Não usados / Atenção

| Item | Motivo | Recomendacao |
|---|---|---|
| `src/modules/accounts/users/server/README.md` | Índice legado; não lista todos os services/repos e o slice `edit-username` | Manter apenas como legado temporário ou migrar/remover em tarefa própria |

---

## Notas de manutencao

Atualize este arquivo quando mudar campos de `users`, normalizacao de username, fluxo de edição de username ou consumers externos de usuário/referral.

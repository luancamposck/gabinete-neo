# accounts/users/profiles/server

Índice da camada server-side de `accounts/users/profiles`.

Este arquivo serve como mapa rápido para entender entrypoints, arquivos principais, dependências e fluxos backend deste submódulo.

---

## Visao geral

Este submódulo concentra leitura e atualização de dados em `user_profiles`. A criação inicial ocorre atomicamente pela trigger do fluxo de Auth.

---

## Entrypoints

| Entrypoint | Arquivo | Observações |
|---|---|---|
| `editUserAddressAction` | `./slices/edit-user-address/actions/edit-user-address.action.ts` | Valida `addressSchemaServer` e chama o use-case |
| `updateUserAddressService` | `./services/update-user-address.service.ts` | Service consumido pelo use-case local para atualizar endereço |

---

## Slices

| Slice | Caminho | Responsabilidade |
|---|---|---|
| `edit-user-address` | `./slices/edit-user-address/` | Atualização de endereço do usuário autenticado |

---

## Actions

| Action | Caminho | Observações |
|---|---|---|
| `editUserAddressAction` | `./slices/edit-user-address/actions/edit-user-address.action.ts` | Recebe `unknown`, valida schema server e repassa dados normalizados |

---

## Use-cases

| Use-case | Caminho | Observações |
|---|---|---|
| `editUserAddressUseCase` | `./slices/edit-user-address/use-cases/edit-user-address.use-case.ts` | Exige usuário autenticado antes de atualizar perfil |

---

## Services locais

| Service | Caminho | Responsabilidade |
|---|---|---|
| `updateUserAddressService` | `./services/update-user-address.service.ts` | Monta patch de endereço e atualiza `user_profiles` via SSR client |

---

## Repos locais

| Repo | Caminho | Responsabilidade |
|---|---|---|
| `insertUserProfileAdminRepo` | `./repos/insert-profile.admin.repo.ts` | Insere em `user_profiles` usando Supabase Admin |
| `updateUserAddressRepo` | `./repos/update-address.repo.ts` | Atualiza endereço em `user_profiles` usando Supabase SSR |

---

## Dependências externas ao módulo

### `auth`

| Import | Uso |
|---|---|
| `@/modules/auth/server/services/get-current-auth-user.service` | Resolver o usuário autenticado antes de editar endereço |

### `shared`

| Import | Uso |
|---|---|
| `@/shared/types/operation-response.types` | Contrato de retorno das camadas server |

### `lib`

| Import | Uso |
|---|---|
| `@/lib/supabase/admin` | Inserção admin de perfil |
| `@/lib/supabase/server` | Atualização SSR do perfil autenticado |

---

## Call Matrix

| Origem | Chama | Observações |
|---|---|---|
| `editUserAddressAction` | `editUserAddressUseCase` | Após validar `addressSchemaServer` |
| `editUserAddressUseCase` | `getCurrentAuthUserService` | Falha como `unauthenticated` ou `infra_error` |
| `editUserAddressUseCase` | `updateUserAddressService` | Usa `user.id` do auth como chave |
| `updateUserAddressService` | `updateUserAddressRepo` | Atualiza campos de endereço |

---

## Fluxos

### Fluxo: Edit User Address

1. `editUserAddressAction` valida o payload com `addressSchemaServer`.
2. `editUserAddressUseCase` resolve o usuário atual com `getCurrentAuthUserService`.
3. `updateUserAddressService` monta `UserProfileUpdate`.
4. `updateUserAddressRepo` atualiza `user_profiles` pelo `user_id`.
5. Retorna `userId` atualizado.

---

## Comportamentos importantes

### Auth/session

`editUserAddressUseCase` depende de sessão válida; sem usuário autenticado retorna `unauthenticated`.

### Infra/Admin

Edição de endereço usa o client SSR da sessão autenticada.

---

## Não usados / Atenção

| Item | Motivo | Recomendacao |
|---|---|---|
| `src/modules/accounts/users/profiles/server/README.md` | Índice legado; também está desatualizado porque não lista `edit-user-address` e `update-address` | Manter apenas como legado temporário ou migrar/remover em tarefa própria |

---

## Notas de manutencao

Atualize este arquivo quando mudarem campos de endereço, validações server-side, repos de `user_profiles` ou dependências com `auth`.

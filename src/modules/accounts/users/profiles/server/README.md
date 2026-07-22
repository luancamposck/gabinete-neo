# accounts/users/profiles/server

Este diretorio contem a camada server-side do modulo **accounts/users/profiles**.

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
- `update-user-address.service` - `./services/update-user-address.service.ts`

## Repos
- `insert-profile.admin.repo` - `./repos/insert-profile.admin.repo.ts`

## Call Matrix

| Entry point | Chama | Observacoes |
|---|---|---|
| `updateUserAddressService` | `updateUserAddressRepo` | atualiza o endereço do usuário autenticado |

## Fluxos

### Fluxo: Update User Address
1) `editUserAddressUseCase(params)`
2) `updateUserAddressService(params)`
3) `updateUserAddressRepo(params)`

## Nao usados
- Itens sem referencia direta via import (relative ou `@/`).
- (nenhum)

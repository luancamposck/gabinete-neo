# organizations/insights/people-map/server

Índice da camada server-side de `organizations/insights/people-map`.

Este arquivo serve como mapa rápido para entender entrypoints, arquivos principais, dependências e fluxos backend deste submódulo.

---

## Visao geral

Este submódulo carrega dados agregados para o mapa de pessoas da organização atual: membros com cidade/estado, total de membros, membros não mapeados e pins geográficos baseados em coordenadas conhecidas.

---

## Entrypoints

| Entrypoint | Arquivo | Observações |
|---|---|---|
| `getMapPinsAction` | `./slices/get-map-pins/actions/get-map-pins.action.ts` | Server Action para carregar pins do mapa |

---

## Slices

| Slice | Caminho | Responsabilidade |
|---|---|---|
| `get-map-pins` | `./slices/get-map-pins/` | Carregar pins e métricas do mapa de pessoas |

---

## Actions

| Action | Caminho | Observações |
|---|---|---|
| `getMapPinsAction` | `./slices/get-map-pins/actions/get-map-pins.action.ts` | Chama diretamente `getMapPinsUseCase` |

---

## Use-cases

| Use-case | Caminho | Observações |
|---|---|---|
| `getMapPinsUseCase` | `./slices/get-map-pins/use-cases/get-map-pins.use-case.ts` | Exige autenticação e resolve tenant pelo host |

---

## Services locais

| Service | Caminho | Responsabilidade |
|---|---|---|
| `listCityPinsForMapService` | `./services/list-city-pins-for-map.service.ts` | Agrega membros por cidade/estado e monta `CityPin[]` |

---

## Repos locais

| Repo | Caminho | Responsabilidade |
|---|---|---|
| `countOrganizationMembersRepo` | `./repos/count-organization-members.repo.ts` | Conta memberships da organização |
| `listMembersWithCityByOrganizationIdRepo` | `./repos/list-members-with-city-by-organization-id.repo.ts` | Lista membros com perfil contendo cidade/estado |
| `listUnmappedMembersByOrganizationIdRepo` | `./repos/list-unmapped-members-by-organization-id.repo.ts` | Lista membros sem cidade preenchida |

---

## Dependências externas ao módulo

### `auth`

| Import | Uso |
|---|---|
| `@/modules/auth/server/services/get-current-auth-user.service` | Exigir usuário autenticado |

### `organizations`

| Import | Uso |
|---|---|
| `@/modules/organizations/server/services/get-organization-id-by-app-domain.service` | Resolver `organizationId` pelo host atual |

### `shared`

| Import | Uso |
|---|---|
| `@/shared/http/get-request-host` | Obter domínio/tenant da requisição |
| `@/shared/types/operation-response.types` | Contrato de retorno |

### `lib`

| Import | Uso |
|---|---|
| `@/lib/supabase/server` | Consultas SSR em memberships, users e profiles |

---

## Call Matrix

| Origem | Chama | Observações |
|---|---|---|
| `getMapPinsAction` | `getMapPinsUseCase` | Entry point do mapa |
| `getMapPinsUseCase` | `getCurrentAuthUserService` | Retorna `unauthenticated` sem sessão |
| `getMapPinsUseCase` | `getRequestHost` | Host ausente vira `org_not_found` |
| `getMapPinsUseCase` | `getOrganizationIdByAppDomainService` | Resolve tenant atual |
| `getMapPinsUseCase` | `listCityPinsForMapService` | Carrega pins e contadores |
| `listCityPinsForMapService` | `listMembersWithCityByOrganizationIdRepo` | Base para agrupamento por cidade |
| `listCityPinsForMapService` | `countOrganizationMembersRepo` | Total de membros |
| `listCityPinsForMapService` | `listUnmappedMembersByOrganizationIdRepo` | Membros sem cidade |

---

## Fluxos

### Fluxo: Get Map Pins

1. `getMapPinsAction` chama `getMapPinsUseCase`.
2. O use-case valida usuário autenticado.
3. Resolve `host` e `organizationId`.
4. `listCityPinsForMapService` roda tres consultas em paralelo.
5. Agrupa membros por `city/state`, usa `BRAZILIAN_CITY_COORDINATES` e inclui Brasília como pin base.
6. Retorna `pins`, `totalMembers`, `mappedMembers` e `unmappedMembers`.

---

## Comportamentos importantes

### Coordenadas ausentes

Se uma cidade não existir em `BRAZILIAN_CITY_COORDINATES`, o service registra `console.warn` e ignora aquele pin, sem falhar o fluxo.

### Sessão e tenant

O fluxo exige usuário autenticado e host resolvido; falhas viram `unauthenticated`, `org_not_found` ou `infra_error`.

---

## Não usados / Atenção

Nenhum item identificado.

---

## Notas de manutencao

Atualize este arquivo quando mudar consultas de membros, formato de `CityPin`, dados de coordenadas, regras de membros não mapeados ou dependência de tenant por host.

# Naming

## Arquivos
- Action: `kebab-case.action.ts`
- Service: `kebab-case.service.ts`
- Repo: `kebab-case.repo.ts`
- Admin repo: `kebab-case.admin.repo.ts`
- Use-case: `kebab-case.use-case.ts`

## Funções (padrão recomendado)
- `signInAction`, `signInService`, `signInRepo`
- `requireDashboardAccessAction`, `requireDashboardAccessUseCase`, etc.

## Verbos por camada
Use verbos diferentes para deixar clara a responsabilidade da camada.

| Camada | Verbo preferido | Exemplo | Intenção |
|---|---|---|---|
| Action | verbo da intenção da UI + `Action` | `createRoleAction` | Entrada pública da operação |
| Use-case | verbo do fluxo completo + `UseCase` | `registerAndJoinAsDriverUseCase` | Orquestração de múltiplos passos |
| Service | verbo de negócio + `Service` | `createRoleService`, `approveApplicationService` | Regra de negócio |
| Repo | verbo de persistência + `Repo` | `insertRoleRepo`, `selectRoleByIdRepo`, `updateRoleRepo`, `deleteRoleRepo` | Operação direta no banco |

Repos devem preferir verbos de persistência:

- `insert*Repo`
- `select*Repo`
- `list*Repo`
- `update*Repo`
- `delete*Repo`
- `upsert*Repo`, somente quando realmente for upsert no banco

Services devem preferir verbos de negócio:

- `create*Service`
- `get*Service`
- `list*Service`
- `update*Service`
- `delete*Service`
- `archive*Service`
- `approve*Service`
- `reject*Service`
- `register*Service`

Não usar nomes de Service que apenas repetem a operação SQL se existir um verbo de negócio mais claro.

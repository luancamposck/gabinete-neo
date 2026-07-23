# Type contracts

Define onde vivem os contratos de tipos específicos dos módulos e quando vale a pena extraí-los das assinaturas das funções.

## Princípio central

> Ownership e fronteiras são rígidos; a extração de tipos é pragmática.

Quando um contrato é extraído, sua localização deve refletir quem o possui e quem pode consumi-lo. Isso não significa criar `Params`, `Data` e `Codes` para toda função: tipos simples e locais podem continuar inline.

## Estrutura

```text
src/modules/<module-name>/
├── server/
│   └── types/
│       └── operations/
│           └── <operation>.types.ts
└── shared/
    └── types/
        ├── flows/
        │   └── <flow>.types.ts
        ├── db.ts
        └── <reusable-semantic-type>.types.ts
```

### `shared/types/flows`

Contém contratos do fluxo completo e seguros para consumo pela UI:

- params, data e codes de Use-cases
- params, data e codes de Actions
- DTOs e projeções públicas específicas do fluxo

Use-case e Action podem manter aliases diferentes quando isso deixa explícita a fronteira, mesmo que os formatos sejam iguais:

```ts
export interface GetPendingApplicationsUseCaseData {
	applications: PendingApplicationDTO[]
}

export type GetPendingApplicationsActionData =
	GetPendingApplicationsUseCaseData
```

### `server/types/operations`

Contém contratos internos extraídos das operações executadas por Services e Repos:

- params e resultado relevante do Repo
- params, data e codes do Service
- tipos manuais exigidos por RPCs, Storage ou limitações de inferência

Esses tipos são detalhes do backend e não podem ser importados pela UI.

### `shared/types/db.ts`

Contém apenas aliases diretos dos tipos gerados pelo Supabase:

```ts
import type { Enums, Tables, TablesInsert, TablesUpdate } from "@/shared/types/supabase"

export type DriverRow = Tables<"drivers">
export type DriverInsert = TablesInsert<"drivers">
export type DriverUpdate = TablesUpdate<"drivers">
export type VehicleType = Enums<"driver_vehicle_type">
```

Esses aliases descrevem persistência; não são DTOs públicos nem contratos de fluxo.

## Árvore de decisão

Ao criar ou mover um tipo, siga esta ordem:

1. É um contrato global, usado por múltiplos módulos?
   - Coloque em `src/shared/types/` com nome semântico.
2. É alias direto de tabela, insert, update, enum ou view real do Supabase?
   - Coloque no `shared/types/db.ts` do módulo.
3. Pertence à resposta pública, à Action, ao Use-case ou a um DTO específico de fluxo?
   - Coloque em `shared/types/flows/<flow>.types.ts`.
4. É um contrato interno de Repo ou Service que precisa ser extraído?
   - Coloque em `server/types/operations/<operation>.types.ts`.
5. É simples, local e não representa uma fronteira relevante?
   - Mantenha inline.

## Quando manter inline

Mantenha inline quando o tipo for pequeno, óbvio, local e improvável de evoluir de forma independente:

```ts
export async function deleteDriverDocumentsService(
	params: { paths: string[] }
): AppResultAsync<null, "infra_error"> {
	// ...
}
```

Exemplos que normalmente não justificam um arquivo próprio:

- `{ id: string }`
- `{ organizationId: string }`
- `{ paths: string[] }`
- retorno de sucesso `null`
- um único code como `"generic_error"`

Repetição isolada de uma forma trivial não obriga sua extração. Extraia quando o tipo passar a expressar uma regra ou contrato que precise evoluir em conjunto.

## Quando extrair

Extraia quando o tipo representar um contrato com semântica própria. Os itens abaixo são indicadores a serem avaliados em conjunto, não gatilhos automáticos:

- faz parte da API pública de uma Action, Route Handler ou Presenter e precisa ser reutilizado fora do entrypoint
- é consumido pela UI ou coordenado por múltiplos arquivos
- possui estrutura aninhada ou projeção própria
- representa um DTO
- contém union de códigos de negócio
- é compartilhado entre camadas e precisa evoluir de forma coordenada
- tipa manualmente retorno de RPC, Storage ou query que não pôde ser inferida
- já está grande ou tem alta probabilidade de crescimento

Um parâmetro trivial não precisa ser extraído apenas porque atravessa Repo e Service. Por outro lado, uma estrutura pequena pode merecer extração quando nomeá-la registra uma regra de negócio ou estabiliza uma fronteira pública relevante.

Exemplo de contrato público de fluxo:

```ts
export interface PendingDriverApplicationDTO {
	applicationId: string
	plate: string
	candidate: {
		id: string
		name: string
	} | null
}

export type GetPendingDriverApplicationsUseCaseCodes =
	| "unauthenticated"
	| "org_not_found"
	| "not_allowed"
	| "generic_error"
```

Exemplo de resultado interno tipado manualmente:

```ts
export interface ApproveDriverApplicationAdminRepoData {
	driver_id: string | null
	error_code: string | null
}
```

## DTOs, queries e views

DTO continua sendo um conceito válido. O que deve ser evitado é um arquivo genérico `dto.ts` que acumula contratos sem ownership claro.

- DTO usado por um fluxo: `shared/types/flows/<flow>.types.ts`
- DTO realmente reutilizado por vários fluxos: arquivo semântico, como `organization-summary.types.ts`
- shape cru de join/query: inferido no Repo ou extraído em `server/types/operations`
- view real do PostgreSQL/Supabase: alias de banco em `shared/types/db.ts`

Não use `View` como sinônimo genérico de `Row`, resultado de join ou modelo para UI. Aliases como `OrganizationView = OrganizationRow` não adicionam semântica e devem ser evitados.

## Dependências permitidas

```text
UI ────────────────> shared/types/flows
UI ────────────────> shared/types/db
Action/Use-case ───> shared/types/flows
Service/Repo ──────> server/types/operations
server/* ──────────> shared/types/*
```

Não é permitido:

- UI importar `server/types/operations`
- arquivo em `shared/` importar qualquer item de `server/`
- contrato interno de Repo ou Service ser colocado em `shared/` apenas para facilitar imports
- criar barrel files para reexportar contratos

## Naming

Use o nome da função ou da camada como prefixo quando o contrato for específico dela:

- `CreateDriverApplicationServiceParams`
- `CreateDriverApplicationServiceData`
- `CreateDriverApplicationServiceCodes`
- `InsertDriverApplicationAdminRepoParams`
- `RegisterAndJoinAsDriverUseCaseData`
- `RegisterAndJoinAsDriverActionCodes`

Sufixos:

- `Params`: entrada estruturada de uma operação
- `Data`: payload de sucesso de Service, Use-case ou Action
- `Codes`: union estável de códigos de falha
- `Result`: resultado bruto que não segue `AppResult`, quando um nome explícito for necessário
- `DTO`: projeção transportada pela borda pública

Não crie aliases de camada apenas para satisfazer simetria. Quando aliases explícitos ajudam a marcar uma fronteira real entre Use-case e Action, eles são permitidos.

## Arquivos que misturam fronteiras

Se um arquivo contém tipos de Repo, Service, Use-case e Action, divida-o pela fronteira de visibilidade, mesmo que os arquivos resultantes tenham o mesmo nome:

```text
server/types/operations/review-driver-application.types.ts
shared/types/flows/review-driver-application.types.ts
```

Se o arquivo ainda agrupa operações diferentes, como `approve`, `reject` e `get-by-id`, divida também por operação interna. O arquivo do fluxo pode continuar representando a intenção completa de revisão.

## Legado e migração

- Não criar novos `shared/types/slices`.
- Não criar novos arquivos-gaveta `dto.ts` ou `views.ts`.
- Código legado não precisa ser migrado como efeito colateral de tarefas sem relação.
- Quando um módulo ou fluxo estiver explicitamente no escopo, migre seus contratos de forma atômica e atualize todos os imports.
- Não mantenha reexports de compatibilidade sem consumidor externo real.
- Preserve o formato público das Actions durante refatorações exclusivamente estruturais.

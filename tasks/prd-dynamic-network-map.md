# PRD: Mapa Dinâmico de Membros da Organização

## Introduction

A página `/dashboard/network/map` exibe um mapa com pins de cidades brasileiras conectadas por linhas hub-and-spoke, mostrando a distribuição geográfica dos membros da organização. Atualmente os dados são **hardcoded** (22 cidades com 4 usuários fictícios cada). Este PRD cobre a substituição por dados reais dos membros, incluindo:

1. **Backend**: buscar membros reais e resolver coordenadas de suas cidades
2. **Formulários**: padronizar campos de cidade/estado nos formulários de endereço para garantir dados limpos
3. **UX do mapa**: contador de membros mapeados e lista de não-mapeados

### Contexto técnico

- Endereços são armazenados na tabela `user_profiles` com campos: `cep`, `street`, `number`, `complement`, `neighborhood`, `city` (text livre), `state` (char 2)
- O campo `state` já é um select padronizado nos formulários (constante `brazilianStates`)
- O campo `city` é texto livre atualmente — será substituído por um select com pesquisa, populado com cidades do dataset por estado
- O mapa usa MapLibre GL + react-map-gl com tiles OpenStreetMap
- O hub (centro das linhas) é Brasília (fixo)
- As coordenadas serão resolvidas via dataset estático [Municipios-Brasileiros](https://github.com/kelvins/Municipios-Brasileiros) (MIT, ~5570 municípios com lat/lng)

---

## Goals

- Exibir membros reais da organização no mapa, agrupados por cidade
- Garantir dados de endereço consistentes via padronização dos formulários
- Informar quantos membros estão mapeados vs. total e quais faltam endereço
- Manter Brasília como hub fixo das linhas hub-and-spoke
- Zero dependência de API externa em runtime para coordenadas

---

## User Stories

### US-001: Dataset de municípios brasileiros (coordenadas + lista por estado)
**Description:** Como desenvolvedor, preciso de um dataset estático que sirva para duas finalidades: (1) resolver `(cidade, estado) → (lat, lng)` para o mapa e (2) popular o select de cidades nos formulários filtrado por estado.

**Acceptance Criteria:**
- [ ] Arquivo `src/modules/organizations/insights/people-map/shared/data/brazilian-city-coordinates.ts` criado
- [ ] Contém `Map<string, { lat: number; lng: number }>` com ~5570 municípios (dados do repo Municipios-Brasileiros) — usado pelo backend para resolver coordenadas
- [ ] Chave normalizada no formato `"cidade-uf"` (sem acentos, lowercase, hífens). Ex: `"sao-paulo-sp"`, `"belo-horizonte-mg"`
- [ ] Helper `normalizeCityStateKey(city: string, state: string): string` exportado para normalização consistente
- [ ] Normalização: `NFD` → remove diacríticos → lowercase → espaços viram hífens → remove caracteres especiais
- [ ] Arquivo `src/shared/data/brazilian-cities-by-state.ts` criado — usado pelos formulários (client-side)
- [ ] Contém `Record<string, string[]>` onde a chave é o UF (ex: `"SP"`) e o valor é array de nomes de cidades em **ordem alfabética** com acentuação original (ex: `["Adamantina", "Adolfo", ..., "Votuporanga"]`)
- [ ] Ambos os arquivos são gerados a partir do mesmo dataset Municipios-Brasileiros
- [ ] Typecheck passa

---

### US-002: Repo leve para buscar membros com cidade/estado
**Description:** Como desenvolvedor, preciso de um repo que retorne apenas os campos necessários para o mapa (id, nome, cidade, estado) de forma performática.

**Acceptance Criteria:**
- [ ] Arquivo `src/modules/organizations/insights/people-map/server/repos/list-members-with-city-by-organization-id.repo.ts` criado
- [ ] Query faz join: `organization_memberships` → `users` (via `auth.users`) → `user_profiles`
- [ ] Seleciona apenas: `users.id`, `users.raw_user_meta_data->name` (como `name`), `user_profiles.city`, `user_profiles.state`
- [ ] Filtra por `organization_id` e onde `city` não é nulo/vazio
- [ ] Retorna tipo tipado com os campos selecionados
- [ ] Typecheck passa

---

### US-003: Service que agrupa membros por cidade e resolve coordenadas
**Description:** Como desenvolvedor, preciso de um service que transforme a lista de membros em `CityPin[]` prontos para o mapa.

**Acceptance Criteria:**
- [ ] Arquivo `src/modules/organizations/insights/people-map/server/services/list-city-pins-for-map.service.ts` criado
- [ ] Chama o repo de US-002
- [ ] Agrupa membros por `(city, state)` usando `normalizeCityStateKey`
- [ ] Resolve coordenadas de cada grupo via lookup de US-001
- [ ] Cidades não encontradas no lookup são ignoradas (log warning com `console.warn`)
- [ ] Monta `CityPin[]` com: `id` = `"br-{state}-{normalized-city}"`, `city`, `state`, `country: "Brasil"`, `lat`, `lng`, `users: { id, name }[]`
- [ ] Brasília (DF) é sempre o primeiro item do array (hub fixo), mesmo que não tenha membros — nesse caso, `users: []`
- [ ] Retorna `OperationResponse<{ pins: CityPin[]; totalMembers: number; mappedMembers: number }>`
- [ ] `totalMembers` = total de membros da org (com e sem endereço); `mappedMembers` = soma de `users.length` de todos os pins
- [ ] Typecheck passa

---

### US-004: Use-case para orquestrar auth + org + pins
**Description:** Como desenvolvedor, preciso de um use-case que orquestre autenticação, resolução de organização e busca de pins, seguindo o padrão existente.

**Acceptance Criteria:**
- [ ] Arquivo `src/modules/organizations/insights/people-map/server/slices/get-map-pins/use-cases/get-map-pins.use-case.ts` criado
- [ ] Segue o padrão de `get-organization-members-for-table.use-case.ts` (MSG constants, prefixLog, etapas numeradas e comentadas)
- [ ] Step 0: `getCurrentAuthUserService()` — verifica autenticação
- [ ] Step 1: `getRequestHost()` — resolve host do tenant
- [ ] Step 2: `getOrganizationIdByAppDomainService()` — resolve `organizationId`
- [ ] Step 3: `listCityPinsForMapService()` — busca pins
- [ ] Retorna `OperationResponse<{ pins: CityPin[]; totalMembers: number; mappedMembers: number }, ErrorCodes>`
- [ ] ErrorCodes: `"unauthenticated" | "org_not_found" | "infra_error"`
- [ ] Typecheck passa

---

### US-005: Action (Server Action)
**Description:** Como desenvolvedor, preciso de uma action thin que exponha o use-case para o Server Component.

**Acceptance Criteria:**
- [ ] Arquivo `src/modules/organizations/insights/people-map/server/slices/get-map-pins/actions/get-map-pins.action.ts` criado
- [ ] Marcado com `"use server"`
- [ ] Chama `getMapPinsUseCase()` e retorna o resultado
- [ ] Typecheck passa

---

### US-006: Page busca dados server-side e passa para MapClient
**Description:** Como usuário, quero ver os membros reais da minha organização no mapa ao acessar `/dashboard/network/map`.

**Acceptance Criteria:**
- [ ] `src/app/dashboard/network/map/page.tsx` modificado para chamar `getMapPinsAction()` server-side
- [ ] Trata erros: redirect em `unauthenticated`/`org_not_found`, throw em `infra_error`
- [ ] Passa `pins`, `totalMembers` e `mappedMembers` como props para `<MapClient />`
- [ ] Page continua sendo Server Component (sem `"use client"`)
- [ ] Typecheck passa
- [ ] Verify in browser using dev-browser skill

---

### US-007: MapClient recebe pins como props
**Description:** Como desenvolvedor, preciso que o MapClient aceite pins dinâmicos em vez de importar dados hardcoded.

**Acceptance Criteria:**
- [ ] `src/modules/organizations/insights/people-map/ui/map-client.tsx` modificado
- [ ] Recebe `pins: CityPin[]`, `totalMembers: number`, `mappedMembers: number` como props
- [ ] Remove import do mock `pins.mock.ts`
- [ ] Passa `pins` para `<WorldPeopleMapMapLibre />`
- [ ] Typecheck passa
- [ ] Verify in browser using dev-browser skill

---

### US-008: Contador de membros mapeados e lista de não-mapeados
**Description:** Como usuário, quero saber quantos membros estão mapeados e quais não têm endereço cadastrado, para ter visibilidade da cobertura do mapa.

**Acceptance Criteria:**
- [ ] Badge/indicador visível no topo do mapa mostrando `"X de Y membros mapeados"` (ex: `"32 de 45 membros mapeados"`)
- [ ] Quando `mappedMembers < totalMembers`, exibir botão/link "Ver não-mapeados"
- [ ] Ao clicar, abrir modal/dialog listando membros sem endereço cadastrado (nome de cada um)
- [ ] Quando `mappedMembers === 0`, exibir empty state: "Nenhum membro com endereço cadastrado" sobre o mapa
- [ ] Typecheck passa
- [ ] Verify in browser using dev-browser skill

---

### US-009: Campo cidade como select com pesquisa, populado por estado
**Description:** Como usuário, quero escolher minha cidade a partir de uma lista oficial de municípios do meu estado, garantindo dados consistentes para o mapa.

**Acceptance Criteria:**
- [ ] No `edit-address-form.tsx` e `register-and-join-form.tsx`: campo "Cidade" substituído por um **select com pesquisa** (combobox/autocomplete)
- [ ] O select de cidade é populado com as cidades do estado atualmente selecionado (dados de `brazilian-cities-by-state.ts` de US-001)
- [ ] Cidades listadas em **ordem alfabética** com acentuação original
- [ ] O select de cidade fica **desabilitado** enquanto nenhum estado estiver selecionado
- [ ] Quando o estado muda (manualmente ou via auto-fill do CEP), a lista de cidades é atualizada e o valor de cidade é limpo
- [ ] O auto-fill do ViaCEP **não preenche** o campo cidade — preenche apenas rua, bairro e estado. O usuário deve selecionar a cidade manualmente no select
- [ ] Campos "Rua" e "Bairro" ficam `readOnly` após auto-fill do ViaCEP (ViaCEP retorna dados canônicos)
- [ ] Se o usuário limpar o CEP ou digitar um CEP inválido, rua e bairro voltam a ser editáveis
- [ ] Indicação visual de readonly para rua e bairro (ex: fundo mais claro, cursor not-allowed)
- [ ] Typecheck passa
- [ ] Verify in browser using dev-browser skill

---

### US-010: Limpeza do mock
**Description:** Como desenvolvedor, quero remover o arquivo de mock após a migração para dados reais.

**Acceptance Criteria:**
- [ ] Arquivo `src/modules/organizations/insights/people-map/shared/mocks/pins.mock.ts` removido
- [ ] Nenhum outro arquivo importa o mock
- [ ] Typecheck passa

---

## Functional Requirements

- FR-1: Criar arquivo de lookup estático com coordenadas de ~5570 municípios brasileiros (fonte: dataset Municipios-Brasileiros, MIT)
- FR-2: Criar arquivo com lista de cidades agrupadas por estado (`Record<UF, string[]>`) em ordem alfabética, para popular o select de cidade nos formulários
- FR-3: Helper `normalizeCityStateKey(city, state)` normaliza nomes removendo acentos, convertendo para lowercase e substituindo espaços por hífens
- FR-4: Repo busca `id`, `name`, `city`, `state` dos membros via join `organization_memberships → users → user_profiles`, filtrando por `organization_id` e `city IS NOT NULL`
- FR-5: Service agrupa membros por `(city, state)`, resolve coordenadas via lookup, e retorna `CityPin[]` com Brasília sempre como primeiro item (hub fixo)
- FR-6: Service retorna `totalMembers` (total de membros da org) e `mappedMembers` (membros com cidade resolvida no lookup)
- FR-7: Use-case orquestra: autenticação → resolução de org por domínio → busca de pins. Retorna `OperationResponse` com error codes padronizados
- FR-8: Page (Server Component) chama action server-side e passa dados como props ao MapClient
- FR-9: MapClient exibe badge `"X de Y membros mapeados"` e botão para ver membros sem endereço
- FR-10: Quando nenhum membro tem endereço, exibir empty state sobre o mapa
- FR-11: Campo "Cidade" nos formulários de endereço é um **select com pesquisa** populado com cidades do estado selecionado (dados do dataset)
- FR-12: Select de cidade fica desabilitado enquanto nenhum estado estiver selecionado; quando o estado muda, cidade é limpa
- FR-13: Auto-fill do ViaCEP preenche rua, bairro e estado — **não preenche cidade** (usuário seleciona manualmente)
- FR-14: Campos rua e bairro ficam `readOnly` após auto-fill do ViaCEP; voltam a ser editáveis se CEP for limpo ou inválido

---

## Non-Goals

- Geocoding de endereço completo (rua + número) — agrupamento é apenas por cidade
- Coordenadas armazenadas no banco de dados — lookup é em memória a partir do dataset estático
- Busca/filtro de membros dentro do mapa (ex: buscar por nome)
- Customização do hub pelo usuário (hub é Brasília fixo)
- Suporte a endereços fora do Brasil
- Migração/correção de dados de endereço existentes no banco
- Fallback visual no mapa para cidades com coordenadas não encontradas (sem pin genérico)
- Link/botão no modal de não-mapeados para editar perfil do membro

---

## Design Considerations

- Reutilizar o componente `WorldPeopleMapMapLibre` existente — a interface de props (`pins: CityPin[]`) já está pronta
- Badge de contagem pode usar os componentes `Badge` do shadcn/ui já disponíveis
- Modal de membros não-mapeados pode reutilizar `Dialog`/`DialogContent` do shadcn/ui (mesmo padrão do modal de detalhes de cidade que já existe no mapa)
- Readonly dos campos rua/bairro após ViaCEP: usar atributo `readOnly` + classes Tailwind para visual (ex: `bg-muted cursor-not-allowed`)
- Select de cidade com pesquisa: avaliar usar componente Combobox do shadcn/ui (baseado em Popover + Command) ou similar já existente no projeto
- O arquivo `brazilian-cities-by-state.ts` será importado client-side nos formulários — manter tamanho razoável (~150KB comprimido para ~5570 nomes)

---

## Technical Considerations

- O dataset Municipios-Brasileiros será baixado uma vez e convertido para `.ts` — não é uma dependência runtime
- O arquivo de coordenadas terá ~200KB (5570 entries com cidade normalizada + lat/lng) — aceitável para bundle server-side
- A normalização de nomes de cidade (remove acentos, lowercase) é fundamental para match entre dados do ViaCEP no banco e chaves do lookup
- O repo deve ser leve e separado do repo existente que traz profile + role completo — performance do mapa não deve ser impactada por dados desnecessários
- Para `totalMembers`, o service precisa também contar membros SEM endereço — pode ser uma query separada no repo ou um count no mesmo join sem o filtro de `city IS NOT NULL`

---

## Success Metrics

- Mapa exibe membros reais da organização agrupados por cidade
- Contador mostra cobertura real de mapeamento (X de Y)
- Membros sem endereço são listados sob demanda
- Campo cidade é selecionado via select padronizado (garantindo match com dataset de coordenadas)
- Campos rua e bairro ficam readonly após auto-fill do ViaCEP
- Nenhuma chamada de API externa em runtime para resolver coordenadas

---

## Open Questions

- O arquivo `brazilian-cities-by-state.ts` será importado nos formulários (client-side). Se o bundle size for um problema, considerar lazy-load por estado ou usar dynamic import. Testar impacto real no bundle.

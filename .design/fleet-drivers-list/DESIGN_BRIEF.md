# Design Brief: Listagem de Motoristas da Frota (`/dashboard/config/fleet/drivers`)

## Problem

Quem gerencia a frota do gabinete aprova candidaturas de motorista em `/dashboard/config/fleet`, mas depois disso perde a visibilidade: não existe, hoje, nenhum lugar no produto que mostre **quem são os motoristas ativos**, com qual placa, em qual veículo, desde quando estão aprovados. O dado existe na tabela `drivers` do banco, mas é invisível — não dá para responder "quantos motoristas temos", "esse motorista ainda está ativo" ou "qual placa está vinculada a este membro" sem ir direto no banco.

## Solution

Uma página de listagem do elenco atual de motoristas: tabela densa (padrão, desktop) ou cards (mobile e opcional no desktop), mostrando placa, tipo de veículo, membro responsável, data de aprovação e status ativo/inativo. É uma tela de **consulta**, não de revisão — sem fila, sem ações de aprovar/rejeitar, sem preview de documento (esses dados não fazem parte do contrato retornado por `getFleetDriversForTableAction`). Busca por nome/e-mail/placa e filtros por tipo de veículo e status resolvem a tarefa real: achar um motorista específico ou entender a composição da frota rapidamente.

## Experience Principles

1. **Consulta, não gestão** — esta tela mostra o estado atual; não introduz mutações (sem toggle de status, sem edição) nesta v1. Cada elemento existe para informar, não para agir.
2. **Densidade com saída no mobile** — tabela é o modo primário (mais dado visível por vez); no mobile o mesmo conteúdo vira cards, nunca uma tabela espremida ou com scroll horizontal forçado.
3. **Consistência com o padrão de Applications** — mesma linguagem visual, mesmos componentes de tabela/busca/filtro/paginação já validados em `/dashboard/config/fleet`. Não inventar um novo vocabulário para a mesma família de telas.

## Aesthetic Direction

- **Philosophy**: Extensão direta do padrão já estabelecido em `ApplicationsExplorer` — não há nova direção estética a definir aqui, é reuso disciplinado.
- **Tone**: Neutro, informativo, "painel operacional". Nenhuma ênfase emocional — nem urgência (não é fila), nem celebração (não é revisão concluída).
- **Reference points**: A própria tela de candidaturas de frota (`applications-explorer.tsx` e seus subcomponentes).
- **Anti-references**: Qualquer coisa que sugira ação pendente ou revisão (badges de urgência, cores de alerta para o simples fato de existir um motorista inativo).

## Existing Patterns

- **Backend já pronto**: `getFleetDriversForTableAction` → `getFleetDriversForTableUseCase` → `listFleetDriversByOrganizationIdService` → `listDriversWithMemberAndOriginApplicationByOrganizationIdAdminRepo`. Contrato: `{ driverId, plate, vehicleType, member: { id, name, email }, approvedAt, isActive }[]`. Autenticação, resolução de organização e permissão (`PERMISSIONS.FLEET_APPLICATIONS_MANAGE`) já tratadas na use-case — a página só precisa tratar os codes de retorno (`unauthenticated`, `org_not_found`, `not_allowed`, `generic_error`), igual `fleet/page.tsx` já faz.
- **Typography/Colors/Spacing**: tokens do tema (ver `globals.css`), sem extensão nova necessária — este fluxo não introduz superfícies novas como o auth gate fez.
- **Padrão de explorer com 3 camadas** (`applications-explorer.tsx`): estado local + `useReactTable` + `usePersistedApplicationsTableState` (versão local; existe equivalente genérico em `@/shared/hooks/use-persisted-table-state` — **usar o genérico**, não duplicar) + toggle de view mode persistido em `localStorage` + `useIsMobile` forçando cards no mobile.
- **Componentes de tabela genéricos** (`src/shared/components/ui/`): `data-table-pagination`, `data-table-view-options`, `data-table-faceted-filter`, `data-table-skeleton`, `table`. Reutilizar diretamente.
- **Badges de domínio fleet** (`application-visuals.tsx`): `VehicleTypeBadge` + `VEHICLE_TYPE_ICONS` e `formatApplicationDate` são genéricos o suficiente para reaproveitar por import direto, apesar do arquivo se chamar "application-visuals" (não vale mover/renomear agora — fora de escopo).
- **Constantes**: `VEHICLE_TYPES` / `VEHICLE_TYPE_LABELS` em `@/modules/fleet/shared/constants/vehicle-type.ts`.
- **Sem componente de Avatar** no design system — nomes de membro são exibidos como texto (nome + e-mail empilhados), igual ao padrão já usado para `candidate` em Applications.

## Component Inventory

| Component | Status | Notes |
| --------- | ------ | ----- |
| `getFleetDriversForTableAction` | Exists | Já implementada e funcional; página só consome. |
| `DriversExplorer` | New | Orquestrador client — versão enxuta de `ApplicationsExplorer`: sem seleção em lote, sem review, sem preview de documento. Table + Cards, `useIsMobile` força cards. |
| `DriversTable` | New | Espelha `ApplicationsTable`: `flexRender` sobre `TableHeader`/`TableBody`/`TableRow`. |
| `DriversCards` | New | Espelha `ApplicationsCards`, sem `Checkbox`/seleção nem `CardFooter` de ações. |
| `drivers-columns.tsx` | New | Colunas: Membro (nome+email), Placa, Tipo (badge), Aprovado em (data), Status (badge). |
| `DriversToolbar` | New | Busca (nome/email/placa, fuzzy) + `DataTableFacetedFilter` para tipo de veículo (reusa opções existentes) e para status (novo: ativo/inativo). |
| `DriverStatusBadge` | New | Badge ativo/inativo. Ativo → `success-subtle`; inativo → tom neutro (`secondary`/`muted`, **não** `destructive-subtle` — inativo não é um erro). |
| `DriversEmptyState` | New | Copy própria: frota sem motoristas aprovados ainda (tom neutro, não "tudo em dia"). |
| `VehicleTypeBadge` / `VEHICLE_TYPE_ICONS` | Exists | Import direto de `application-visuals.tsx`. |
| `formatApplicationDate` | Exists | Import direto de `application-visuals.tsx`; usar para `approvedAt`. |
| `usePersistedTableState` | Exists | Usar o hook genérico de `@/shared/hooks/`, não a cópia local de `applications`. |
| `useIsMobile` | Exists | `@/shared/hooks/use-mobile`. |
| `DataTablePagination` / `DataTableViewOptions` / `DataTableFacetedFilter` / `DataTableSkeleton` | Exists | Reuso direto. |
| `Tabs`/`TabsList`/`TabsTrigger` (view switcher) | Exists | Mesmo padrão do switcher Tabela/Cards. |
| `page.tsx` (`/dashboard/config/fleet/drivers`) | New | Server component: chama a action, trata os 4 error codes (`redirect("/")`, `redirect("/tenant-not-found")`, `notFound()`, `throw`), renderiza `DriversExplorer`. |
| `loading.tsx` | New | Espelha `fleet/loading.tsx`, sem o botão de "Adicionar" nem a segunda linha de filtro exclusiva de applications. |

## Key Interactions

- **Alternar Tabela ↔ Cards**: `Tabs` controla `viewMode`, persistido em `localStorage` (chave própria, ex. `fleet-drivers-view-mode`). No mobile, sempre cards (mesma regra de `ApplicationsExplorer`).
- **Buscar**: campo de busca filtra por nome do membro, e-mail e placa (fuzzy, mesmo padrão de `rankItem`/`match-sorter-utils` da toolbar de applications).
- **Filtrar**: facetados por tipo de veículo e por status (ativo/inativo). Filtros combináveis; "Limpar filtros" quando algum estiver ativo.
- **Ordenar** (tabela): colunas Membro e Aprovado em ordenáveis, como em Applications. Ordenação default recomendada: `approvedAt` descendente (motoristas aprovados mais recentemente primeiro).
- **Paginar**: `DataTablePagination`, mesmo padrão (10 por página).
- **Sem ações de linha**: nem tabela nem cards têm coluna/botão de ação nesta v1 — é puramente informativo.

## Responsive Behavior

- **Mobile (< `md`)**: `useIsMobile` força `viewMode = "cards"`; grid de 1 coluna. Busca e filtros empilham/quebram linha como já ocorre na toolbar de applications.
- **Tablet/Desktop (≥ `md`)**: usuário escolhe entre Tabela e Cards via `Tabs`; cards em grid `md:grid-cols-2 xl:grid-cols-3` (mesma proporção de `ApplicationsCards`). `DataTableViewOptions` (mostrar/ocultar colunas) só aparece no modo Tabela.
- Nenhum componente muda de **comportamento** entre breakpoints além da própria troca tabela/cards, que já é o padrão estabelecido.

## Accessibility Requirements

- Mesma base já usada em Applications: `aria-label` nos inputs de busca e nos checkboxes (não aplicável aqui, sem seleção), contraste AA nos badges de status (`success-subtle`/`secondary` sobre fundo `card` já validados no tema).
- Tabela com `<TableHead>` semânticos e ordenação anunciável via botão (não apenas clique no cabeçalho, como já é o padrão de `ArrowUpDown` + `Button`).
- Cards mantêm hierarquia de heading correta (nome do membro como texto forte, não `<h*>` solto fora de contexto — seguir o mesmo padrão de `ApplicationsCards`).
- Estados vazios e de carregamento (`DriversEmptyState`, `loading.tsx`) comunicam claramente o estado sem depender só de cor.

## Out of Scope

- Qualquer ação de mutação: ativar/desativar motorista, editar placa/tipo de veículo, remover motorista. Fica para uma v2 de "gestão", não "listagem".
- Preview de documentos (CRLV/CNH) — não fazem parte do contrato de dados desta tela.
- Seleção em lote / bulk actions — não há ação em lote possível sem mutação.
- Navegação de entrada (sidebar, sub-nav, breadcrumb entre Candidaturas ↔ Motoristas) — combinado que não é escopo desta rodada; a página deve funcionar standalone via URL direta.
- Um 3º modo de visualização tipo "Cockpit" ou "Agrupado" — decidido explicitamente que só Tabela + Cards fazem parte desta v1.
- Alterar o contrato de `getFleetDriversForTableAction`/use-case/service/repo — já estão prontos e corretos para o que esta tela precisa.
- Corrigir o arquivo de tipos órfão `src/modules/fleet/shared/types/slices/list-fleet-drivers-by-organization-id.types.ts` (não utilizado em lugar nenhum) — observação registrada, não faz parte deste fluxo.
```

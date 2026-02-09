# Organization Members Data Table - Guia Técnico

Este guia explica como a tabela de membros da organização funciona, quais componentes participam, e como evoluir com segurança.

## Visão geral

A tabela é construída com `@tanstack/react-table` e recebe dados já normalizados no formato `OrganizationMemberTableRow[]`.

Arquivos principais desta pasta:
- `organization-members-table.tsx`: composição da tabela e estado do TanStack.
- `organization-members-table-toolbar.tsx`: busca global e filtros facetados.
- `columns.tsx`: definição de colunas, renderização de células e regras de filtro.
- `organization-member-actions.tsx`: ações por linha (sheet de detalhes do membro).
- `organization-member-address-popover.tsx`: popover com endereço completo.
- `use-persisted-table-state.ts`: persistência de sorting/filtros/visibilidade em `localStorage`.

Dependências de UI reutilizadas:
- `@/components/ui/data-table.tsx`: renderiza cabeçalho, linhas, estado vazio e paginação.
- `@/components/ui/data-table-pagination.tsx`: controle de paginação e tamanho de página.
- `@/components/ui/data-table-faceted-filter.tsx`: filtro multi-seleção por coluna.
- `@/components/ui/data-table-view-options.tsx`: alternância de visibilidade de colunas.

## Fluxo de dados

1. O backend chama `getOrganizationMembersForTableAction` em:
   - `src/modules/organizations/memberships/server/slices/get-organization-members-for-table/actions/get-organization-members-for-table.action.ts`
2. A action converte o retorno do use case para `OrganizationMemberTableRow[]`.
3. O componente `OrganizationMembersTable` recebe `data` via props.
4. `useReactTable` cria os modelos de:
   - linhas base (`getCoreRowModel`)
   - filtro (`getFilteredRowModel`)
   - ordenação (`getSortedRowModel`)
   - paginação (`getPaginationRowModel`)
   - facetas para filtros (`getFacetedRowModel`, `getFacetedUniqueValues`)
5. O `DataTable` renderiza a tabela e o `DataTablePagination`.

## Componente raiz da tabela

Arquivo: `organization-members-table.tsx`

Responsabilidades:
- Registrar colunas (`organizationMembersColumns`).
- Definir filtro global fuzzy (`fuzzyFilter`) com `rankItem` usando:
  - nome
  - e-mail
  - telefone
- Controlar estados do TanStack:
  - `sorting`
  - `columnFilters`
  - `columnVisibility`
  - `globalFilter`
  - `rowSelection`
- Persistir parte do estado via `usePersistedTableState`.

Configuração padrão atual:
- Chave de persistência: `organization-members-table-state`.
- Ordenação inicial: `createdAt` ascendente (`desc: false`).
- Coluna `state` inicia oculta (`columnVisibility.state = false`).

## Persistência de estado

Arquivo: `use-persisted-table-state.ts`

Persistido em `localStorage`:
- `sorting`
- `columnFilters`
- `columnVisibility`

Comportamento:
- No mount, tenta recuperar estado salvo (com fallback para `initialState`).
- A cada mudança, salva novamente no `localStorage`.
- `globalFilter` e `rowSelection` **não** são persistidos.

## Toolbar e filtros

Arquivo: `organization-members-table-toolbar.tsx`

Funcionalidades:
- Campo de busca global (`Input`) para nome/e-mail/telefone.
- Filtro facetado de Estado (`state`), gerado dinamicamente com valores únicos da coluna.
- Filtro facetado de Status (`isActive`) com opções fixas:
  - `true` => Ativo
  - `false` => Inativo
- Botão `Limpar filtros`:
  - executa `table.resetColumnFilters()`
  - limpa busca global via `table.setGlobalFilter("")`

## Colunas da tabela

Arquivo: `columns.tsx`

### Colunas e comportamento

- `userName` (Nome)
  - `accessorFn`: `row.user.name || row.user.email`
  - Exibe fallback `Sem nome cadastrado`.

- `phone` (Telefone)
  - Formata com `formatPhone`.
  - Exibe `-` quando vazio.

- `email` (E-mail)
  - Exibição simples do e-mail.

- `location` (Localização)
  - Exibe resumo `cidade / estado`.
  - Mostra `OrganizationMemberAddressPopover` para endereço completo.

- `state` (Estado)
  - Usa `row.user.address.state`.
  - `enableSorting: false`.
  - Filtro multi-seleção customizado (`includes` em array de estados).
  - É ocultável (`enableHiding: true`).

- `role` (Permissão)
  - Badge com tradução parcial:
    - `OWNER` -> Owner
    - `ADMIN` -> Admin
    - `MEMBER` -> Membro

- `isActive` (Status)
  - Indicador visual (dot + label Ativo/Inativo).
  - Filtro customizado por string (`"true"`/`"false"`).

- `createdAt` (Entrou em)
  - Header clicável para alternar sorting.
  - Formata data/hora pt-BR.

- `actions`
  - Renderiza `OrganizationMemberActions`.
  - Não ordenável e não ocultável.

## Ações por membro

Arquivo: `organization-member-actions.tsx`

A coluna de ações abre um `Sheet` com detalhes do usuário:
- nome e e-mail
- permissão e status
- data de entrada na organização
- contato (e-mail/telefone)
- endereço (com CEP formatado)

Não há mutações de dados nesse componente; ele é somente leitura.

## Popover de endereço

Arquivo: `organization-member-address-popover.tsx`

Regras:
- Se `address` não existir, não renderiza.
- Se existir mas estiver semanticamente vazio (todos os campos sem valor), não renderiza.
- Quando renderiza, mostra bloco de "Endereço completo" com os campos disponíveis.

## Paginação

Renderizada por `DataTablePagination`.

Funcionalidades:
- Exibe contagem de linhas selecionadas e filtradas.
- Permite trocar `pageSize` (10, 20, 30, 40, 50).
- Navegação entre páginas:
  - primeira
  - anterior
  - próxima
  - última

Observação: a paginação é client-side porque os dados chegam completos para o `useReactTable`.

## Visibilidade de colunas

`DataTableViewOptions` usa `columnNameMap` definido em `organization-members-table.tsx` para labels amigáveis no menu `Colunas`.

Somente colunas com `accessorFn` e `getCanHide()` entram na lista de alternância.

## Estado vazio

Quando não há linhas após filtro, `DataTable` mostra:
- `Nenhum resultado.`

## Extensões comuns

### Adicionar nova coluna

1. Criar item em `organizationMembersColumns` (`columns.tsx`).
2. Adicionar label em `columnNameMap` (`organization-members-table.tsx`) para aparecer corretamente em `Colunas`.
3. Se a coluna precisar de filtro facetado, incluir controle na toolbar.
4. Garantir que o backend preencha o campo no tipo `OrganizationMemberTableRow`.

### Adicionar novo filtro

1. Definir `filterFn` na coluna (se necessário).
2. Expor o filtro no toolbar com `DataTableFacetedFilter`.
3. Validar conversão de tipo (ex.: boolean para string) na comparação do filtro.

### Persistir novos estados da tabela

O hook atual persiste apenas sorting/filtros/visibilidade.
Se quiser persistir mais estados (ex.: paginação), ampliar `PersistedTableState` e sincronização no `useEffect`.

## Pontos de atenção

- O filtro global fuzzy considera apenas nome, e-mail e telefone.
- `createdAt` assume string parseável por `Date`.
- `state` e `isActive` usam filtros por array; mantenha formato consistente ao setar valores.
- `columnVisibility` é mesclado com `initialState`, então defaults novos continuam aplicáveis mesmo com estado antigo salvo.

## Checklist rápido para manutenção

- Mudou tipo de dado? Atualize:
  - `organization-members-table.types.ts`
  - action de mapeamento no server
  - coluna correspondente na UI
- Mudou filtros? Teste:
  - combinação entre busca global + facetas
  - botão `Limpar filtros`
- Mudou colunas? Verifique:
  - menu `Colunas`
  - ordenação/filtro/hiding conforme esperado

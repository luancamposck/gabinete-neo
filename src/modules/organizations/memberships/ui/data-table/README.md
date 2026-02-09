# Members Data Table - Guia Técnico

Guia atualizado da tabela de membros da organização (`ui/data-table`).

## Visão geral

A tabela usa `@tanstack/react-table` com:
- busca global fuzzy (nome, e-mail, telefone)
- filtros facetados (estado e status)
- ordenação
- paginação client-side
- persistência parcial de estado em `localStorage`
- ações por linha condicionadas por permissão

## Estrutura atual

- `table/members-table.tsx`
  - Componente raiz da tabela.
  - Monta `useReactTable`.
  - Injeta `meta` com permissões.

- `table/members-table-toolbar.tsx`
  - Busca global.
  - Filtros facetados de `state` e `isActive`.
  - Limpeza de filtros.

- `table/use-persisted-table-state.ts`
  - Persiste `sorting`, `columnFilters` e `columnVisibility`.

- `columns/members-columns.tsx`
  - Definição de colunas e `filterFn` por coluna.
  - Renderização da célula de ações.

- `actions/member-actions-cell.tsx`
  - Renderiza botão de detalhes (Eye).
  - Renderiza menu de configurações (Settings) quando permitido.

- `actions/member-settings-menu.tsx`
  - Dropdown com ação “Mudar Cargo”.

- `sheets/member-details-sheet.tsx`
  - Sheet com dados completos do membro.
  - Exibe card “Convidado por”.
  - Exibe card administrativo opcional.

- `sheets/member-role-change-sheet.tsx`
  - Sheet de simulação de troca de cargo.

- `shared/member-address-popover.tsx`
  - Popover de endereço completo.

- `shared/member-admin-actions-card.tsx`
  - Card de ações administrativas.

- `table-meta.types.ts`
  - Contrato de `table.options.meta` (`hasPermission`, `canManageMembers`).

## Fluxo de dados

1. Server action `getOrganizationMembersForTableAction` retorna:
   - `members: OrganizationMemberTableRow[]`
   - `permissionsKeys: string[]`
2. `MembersTable` recebe esses dados por props.
3. `MembersTable` cria `permissionsSet` e injeta `tableMeta` no TanStack.
4. `membersColumns` usa `table.options.meta` para definir se a coluna de ações permite gestão.
5. `MemberActionsCell` abre:
   - `MemberDetailsSheet` (sempre)
   - `MemberSettingsMenu` + `MemberRoleChangeSheet` (somente com permissão)

## Componente raiz (`members-table.tsx`)

Responsabilidades:
- Configura coluna, filtros e modelos do TanStack.
- Define `fuzzyFilter` global com `rankItem`.
- Mantém estados:
  - `sorting`
  - `columnFilters`
  - `columnVisibility`
  - `rowSelection`
  - `globalFilter`
- Define estado inicial:
  - `sorting`: `joinedAt` ascendente (`desc: false`)
  - `columnVisibility.state = false`
- Usa chave de persistência:
  - `organization-members-table-state`

## Permissões e `table.meta`

`MembersTable` cria `tableMeta` com:
- `hasPermission(permission)`
- `canManageMembers` (baseado em `PERMISSIONS.ORG_MEMBERSHIP_ROLE_UPDATE`)

Na coluna `actions`:
- `canManageMembers = false`:
  - apenas botão de visualizar detalhes
- `canManageMembers = true`:
  - visualizar detalhes + menu de configuração + sheet de mudança de cargo

## Toolbar e filtros

`members-table-toolbar.tsx`:
- Input de busca global: filtra por nome/e-mail/telefone.
- Filtro de estado (`state`): opções dinâmicas via `getFacetedUniqueValues()`.
- Filtro de status (`isActive`): opções fixas:
  - `true` => Ativo
  - `false` => Inativo
- Botão “Limpar filtros”:
  - `table.resetColumnFilters()`
  - `table.setGlobalFilter("")`

## Colunas

Definidas em `columns/members-columns.tsx`:
- `userName` (Nome)
- `phone` (Telefone)
- `email` (E-mail)
- `location` (Localização + `MemberAddressPopover`)
- `state` (Estado, ocultável, sem sorting, com filtro de múltipla seleção)
- `role` (Permissão, badge)
- `isActive` (Status, filtro por `"true"/"false"`)
- `joinedAt` (Entrou em, ordenável)
- `actions` (célula de ações)

Observações:
- Datas são formatadas em `pt-BR`.
- `role` usa mapeamento (`OWNER`, `ADMIN`, `MEMBER`).

## Sheets e ações de linha

### `MemberDetailsSheet`
Exibe:
- nome e e-mail
- permissão e status
- “Entrou em”
- contato
- endereço
- “Convidado por” (`invitedByUserName`, com fallback `Não informado`)
- `MemberAdminActionsCard` quando `showAdminActions` for `true`

### `MemberRoleChangeSheet`
- Estado atual: interface de simulação (sem mutação persistente).
- Ações de cargo e botão “Salvar alteração (simulação)” desabilitado.

## Persistência de estado

`use-persisted-table-state.ts` persiste no `localStorage`:
- `sorting`
- `columnFilters`
- `columnVisibility`

Não persiste:
- `globalFilter`
- `rowSelection`
- paginação

## Componentes de base reutilizados

A tabela depende dos componentes compartilhados:
- `@/components/ui/data-table`
- `@/components/ui/data-table-pagination`
- `@/components/ui/data-table-faceted-filter`
- `@/components/ui/data-table-view-options`

## Extensões comuns

### Adicionar nova coluna
1. Criar em `columns/members-columns.tsx`.
2. Atualizar `columnNameMap` em `table/members-table.tsx`.
3. Se necessário, adicionar filtro na toolbar.
4. Garantir payload no tipo `OrganizationMemberTableRow` + action server.

### Adicionar nova ação administrativa
1. Adicionar item em `actions/member-settings-menu.tsx`.
2. Criar sheet/componente correspondente.
3. Orquestrar abertura em `actions/member-actions-cell.tsx`.
4. Proteger por permissão via `table.meta`.

### Transformar mudança de cargo em feature real
1. Conectar `member-role-change-sheet.tsx` a action server.
2. Tratar loading, erro e sucesso.
3. Atualizar cache/revalidação da listagem.

## Checklist rápido

- Mudou contrato de dados? Atualizar:
  - `organization-members-table.types.ts`
  - action `get-organization-members-for-table.action.ts`
  - colunas/sheets afetados
- Mudou permissões? Validar:
  - visibilidade das ações no `MemberActionsCell`
- Mudou filtros? Testar:
  - busca global + filtros facetados
  - botão “Limpar filtros”

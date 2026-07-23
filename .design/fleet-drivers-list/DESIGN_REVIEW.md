# Design Review: Listagem de Motoristas da Frota (`/dashboard/config/fleet/drivers`)

Reviewed against: DESIGN_BRIEF.md
Philosophy: Reuso disciplinado do padrão de `ApplicationsExplorer` (sem nova direção estética)
Date: 2026-07-22

## Screenshots Captured

Nenhuma captura via Playwright nesta rodada — instrução explícita do usuário para revisar
apenas por código, usando a screenshot que ele mesmo colou na conversa (não persistida em
disco por mim, pois não recebi um caminho de arquivo para o asset colado).

| Fonte                          | Breakpoint          | Descrição                                                                 |
| ------------------------------- | -------------------- | -------------------------------------------------------------------------- |
| Screenshot colada pelo usuário | Desktop, dark mode    | `/dashboard/config/fleet/drivers`, modo Tabela, 2 registros reais (seed). |

Não verificado nesta rodada (sem captura própria): modo Cards, breakpoint mobile/tablet,
light mode, estado vazio, estado "sem resultados para o filtro", badge "Inativo", estados de
foco/hover. Recomenda-se uma segunda passada visual (Playwright ou screenshots manuais) para
fechar esses pontos.

## Summary

A implementação segue fielmente o padrão de Applications — dados corretos, hierarquia
correta, tom neutro respeitado (sem badge de urgência, sem CTA de mutação). Um defeito real
foi encontrado ao ler a screenshot com atenção: o rodapé de paginação exibe **"0 de 2
linha(s) selecionada(s)."**, um texto de contagem de seleção que não faz sentido nesta tela
— não há checkbox nem seleção de linha em lugar nenhum, por decisão explícita do brief
("somente leitura"). É herança direta do componente `DataTablePagination` genérico, que
sempre imprime essa linha. Também identifiquei que o fundo de partículas `Vortex` (o mesmo
componente removido do gate de autenticação por ser ruído visual/custo de performance)
continua montado globalmente no shell do dashboard em modo dev — não é responsabilidade
desta feature, mas está visivelmente poluindo a screenshot revisada.

## Must Fix

1. **Rodapé de paginação mostra contagem de seleção numa tabela sem seleção**:
   [drivers-explorer.tsx](src/modules/fleet/shared/ui/drivers/drivers-explorer.tsx) usa
   `<DataTablePagination table={table} />` sem nenhuma coluna de seleção (nem `rowSelection`
   state, nem checkbox column em
   [drivers-columns.tsx](src/modules/fleet/shared/ui/drivers/drivers-columns.tsx)). O
   componente genérico [data-table-pagination.tsx:16](src/shared/components/ui/data-table-pagination.tsx#L16)
   sempre renderiza `"{selecionadas} de {total} linha(s) selecionada(s)."`, que como não há
   seleção possível sempre lê **"0 de 2 linha(s) selecionada(s)."** — confirmado literalmente
   no rodapé da screenshot revisada. Isso é uma cópia confusa/quebrada para o usuário final.
   _Fix: adicionar um prop opcional (ex. `showSelectionCount?: boolean`, default `true`) ao
   `DataTablePagination` genérico para preservar o comportamento em Applications e desligar
   a linha em Drivers — ou renderizar só "Página X de Y" + seletor de linhas por página
   quando não há seleção. Extensão aditiva, não quebra o uso existente._

## Should Fix

1. **Toggle "Colunas" pode ser complexidade desnecessária para 5 colunas**: em Applications
   (8 colunas), esconder colunas reduz densidade de forma real. Em Drivers, só há 5 colunas
   (Membro, Placa, Tipo, Aprovado em, Status), todas essenciais para a tarefa de consulta —
   o próprio princípio do brief ("densidade com saída no mobile", tom "consulta, não
   gestão") não pede customização de colunas. _Fix: considerar remover `DataTableViewOptions`
   de `DriversExplorer` e simplificar o canto superior direito da toolbar para só os tabs
   Tabela/Cards._
2. **Fundo `Vortex` ligado globalmente no shell do dashboard em dev** —
   [dashboard/layout.tsx:64-68](src/app/dashboard/layout.tsx#L64-L68) monta o mesmo `Vortex`
   que foi removido do gate de autenticação (por custo de canvas/rAF e ruído visual), atrás
   de **toda** página do dashboard quando `NODE_ENV === "development"`. É isso que aparece
   como pontos coloridos espalhados atrás da tabela na screenshot revisada. **Fora do escopo
   desta feature** (é comportamento do shell, não desta tela) — sinalizando para o time
   decidir, não é algo que vou tocar sem pedido explícito, já que afeta todas as páginas do
   dashboard igualmente.

## Could Improve

1. **Placeholder de busca não menciona e-mail**: `"Buscar por nome ou placa..."` em
   [drivers-toolbar.tsx](src/modules/fleet/shared/ui/drivers/drivers-toolbar.tsx), mas o
   `fuzzyFilter` em `drivers-explorer.tsx` também casa por e-mail do membro. Mesma imprecisão
   já existe no toolbar original de Applications — corrigir aqui sozinho criaria
   inconsistência entre as duas telas; melhor tratar as duas juntas se for relevante.
2. **Sem verificação visual do modo Cards, mobile e estado "Inativo"** nesta rodada — a
   screenshot só cobre desktop/dark/Tabela com 2 motoristas ativos. Recomenda-se confirmar
   especialmente o card no mobile (grid 1 coluna) e o contraste do badge `secondary`
   "Inativo" antes de considerar a tela pronta.

## What Works Well

- **Fidelidade ao padrão reutilizado**: toolbar, tabela, badges e paginação leem-se como a
  mesma família visual de Applications — não há vocabulário novo inventado, exatamente como
  o brief pediu.
- **Semântica de status respeitada**: "Ativo" usa `success-subtle` (visível corretamente na
  screenshot, verde legível sobre o tema escuro); nenhum tom de alerta usado para o simples
  fato de existir um motorista — confirma a decisão do brief de não usar `destructive` para
  "Inativo".
- **Tom "somente leitura" honrado no layout**: ao contrário de `fleet/page.tsx` (que tem o
  botão "Adicionar candidatura"), o header de Drivers não tem nenhum CTA de mutação — só
  título e subtítulo, coerente com a decisão explícita de v1 read-only.
- **Contagem de resultados** ("2 motoristas") correta, discreta, mesmo tratamento tipográfico
  secundário de Applications.
- **Dados mapeados corretamente**: nome+e-mail empilhados, placa em mono uppercase, badge de
  tipo com ícone, data formatada — tudo bate com o contrato real de
  `getFleetDriversForTableAction`, visível e correto na screenshot.
```

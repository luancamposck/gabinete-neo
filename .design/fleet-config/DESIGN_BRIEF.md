# Design Brief: Fila de Candidaturas de Frota (`/dashboard/config/fleet`)

## Problem

Quem administra a organização precisa revisar candidaturas de motorista quase todo dia. Cada candidatura tem documentos (CRLV, CNH) e dados do veículo que precisam ser conferidos antes de aprovar ou rejeitar. Hoje isso é uma pilha de cards: para conferir um documento a pessoa abre uma aba nova, perde o contexto, volta, rola até achar de novo o card certo, aprova, e recomeça. Quando há dezenas pendentes, a triagem vira um trabalho lento e repetitivo — e no celular (onde boa parte dessa gestão acontece) fica ainda pior. A pessoa quer despachar a fila com confiança e o mínimo de cliques, sem sentir que está preenchendo um formulário de repartição.

## Solution

Uma central de triagem de candidaturas rápida e escaneável. A pessoa abre a tela, entende de imediato quantas pendências existem, busca/filtra até o subconjunto que quer tratar, e resolve cada caso — conferindo documentos num preview que não tira ela da tela e aprovando/rejeitando ali mesmo. Quando quer ir no volume, seleciona vários e age em lote. No desktop ela escolhe como quer trabalhar: uma **tabela** densa para bater o olho e despachar em massa, **cards** para uma leitura mais visual, ou um **cockpit de revisão** (lista + detalhe lado a lado) para varrer caso a caso com o documento sempre à vista. No celular, uma lista de cards empilhados com as mesmas ações e um conjunto enxuto de filtros. Institucional na sobriedade visual; ágil na quantidade de passos.

## Experience Principles

1. **Despachar, não navegar** — a ação (aprovar/rejeitar/conferir doc) vem até onde os olhos já estão; cada candidatura deve poder ser resolvida sem trocar de página nem abrir aba. Menos cliques por decisão é a métrica que manda.
2. **Densidade sob demanda** — a tela mostra o essencial de cada candidatura por padrão e revela o detalhe (documentos, campos do veículo) só quando a pessoa pede. O mesmo dado serve tanto para bater o olho quanto para inspecionar.
3. **Sóbrio, não solene** — visual institucional que transmite confiança (tipografia clara, cinzas neutros, hierarquia firme), sem peso burocrático: nada de tabelas frias com molduras pesadas, jargão ou formulários intimidantes. Espaço, ritmo e microfeedback fazem parecer leve.

## Aesthetic Direction

- **Philosophy**: _Functional institutional / "quiet admin"_ — utilitário e denso onde precisa, mas com respiro e polimento. Superfícies neutras (shadcn new-york sobre base slate), acento sóbrio, foco no conteúdo. Próximo de um "cockpit" administrativo bem resolvido, não de um dashboard chamativo.
- **Tone**: Calmo, confiável, eficiente. Transmite ordem e controle sem rigidez.
- **Reference points**: Linear (densidade + atalhos + estados de seleção), painel de moderação/aprovação do Stripe & Vercel (listas escaneáveis com ação inline e detalhe em painel), GOV.BR Design System (clareza institucional acessível) — pegar a clareza, não o peso.
- **Anti-references**: ERP/planilha corporativa antiga (bordas grossas, tudo à mostra, zero hierarquia); wizard/formulário de repartição pública; dashboard "marketing" cheio de gradientes, ilustrações e cor. Nada que faça a triagem parecer um processo protocolar.

## Existing Patterns

Padrões e tokens já presentes no código que este design deve respeitar e estender (shadcn/ui, sem `tailwind.config` — tokens em `src/app/globals.css`).

- **Typography**: Geist Sans (corpo/títulos) e Geist Mono (dados monoespaçados, ex.: placa). Título de página: `text-2xl font-semibold tracking-tight`. Subtítulo/descrição: `text-sm text-muted-foreground`. Subcabeçalho de seção (contagem): `text-sm font-medium text-muted-foreground`.
- **Colors**: Paleta OKLCH via CSS variables com light/dark (`.dark`). Semânticos: `background/foreground`, `card`, `muted/muted-foreground`, `primary`, `secondary`, `accent`, `destructive`, `border`, `input`, `ring`. Charts `--chart-1..5` disponíveis se precisar de acento categórico. **Não introduzir cores novas** fora desses tokens.
- **Spacing**: escala Tailwind padrão. Página segue `p-4 space-y-6`; seções `space-y-2`. `--radius: 0.625rem` (cantos suaves, não quadrados). Breakpoint extra `xs: 425px` disponível além dos padrões (`sm/md/lg…`).
- **Components**: layout de dashboard com `SidebarProvider` + `SidebarInset` (container centralizado, header próprio com toggle de tema). Padrão de página de config já estabelecido em `users/page.tsx` (header + `<section>` com contagem + componente "Explorer" client sobre `data-table`). Feedback via `sonner` (toasts). Confirmações destrutivas via `Dialog` (ver `driver-application-actions.tsx`).

## Component Inventory

| Component | Status | Notes |
| --- | --- | --- |
| `data-table` (+ `-pagination`, `-faceted-filter`, `-view-options`, `-skeleton`) | Exists | Base do modo Tabela no desktop; faceted-filter para tipo de veículo; skeleton para loading. |
| `card` | Exists | Base do modo Cards e da lista mobile. |
| `badge` | Exists | Tipo de veículo; possível badge de "novo/urgente" por data. |
| `dialog` | Exists | Confirmação de rejeição (single) e confirmação de ação em lote. |
| `sheet` | Exists | Painel de filtros no mobile e/ou preview de documento em tela cheia no mobile. |
| `checkbox` | Exists | Seleção de linhas/cards para ações em lote. |
| `input` / `input-group` | Exists | Busca por nome/placa. |
| `tabs` / `segmented` | Exists (`tabs`) | Alternador de modo de visualização (Tabela / Cards / Cockpit) no desktop. Avaliar um segmented control leve com ícones. |
| `tooltip`, `separator`, `scroll-area`, `command`/`combobox` | Exists | Suporte (dicas em ícones, painéis roláveis, combos de filtro avançado). |
| `ApplicationsExplorer` (client container) | New | Orquestra modo de visualização, filtros, busca, estado de seleção e persistência (view-mode/filtros na URL ou `use-persisted-table-state`). |
| View-mode switcher | New | Segmented control (Tabela / Cards / Cockpit) — só desktop; persiste preferência. |
| `ApplicationCard` | Modify | Evolui `driver-applications-list.tsx`: adiciona checkbox de seleção, ações inline e gatilho de preview de doc. |
| Table columns def | New | Colunas: seleção, candidato, placa (mono), tipo (badge), modelo/ano/cor, enviada em, docs, ações. |
| `ReviewCockpit` (split master-detail) | New | Terceiro modo original: fila compacta à esquerda + painel de detalhe com preview de documento e ações à direita; navegação por teclado. |
| `DocumentPreview` (sheet/dialog) | New | Preview inline de CRLV/CNH (imagem/PDF via signed URL), sem abrir nova aba. |
| `BulkActionBar` | New | Barra fixa que aparece quando há seleção: contagem + Aprovar/Rejeitar em lote. |
| `InlineApplicationActions` | Modify | Extrai/generaliza `driver-application-actions.tsx` para uso em linha, card e cockpit. |
| `FleetFilters` | New | Busca + filtro por tipo; forma simples no mobile (sheet), forma completa no desktop (barra). |
| Empty / zero-results state | Modify | Distinguir "nenhuma pendente" (positivo, fila zerada) de "nenhum resultado para os filtros" (com ação de limpar filtros). |

## Key Interactions

- **Alternar visualização (desktop)**: segmented control Tabela / Cards / Cockpit. Troca preserva filtros, busca e seleção; a preferência de modo persiste entre sessões. No mobile o controle não aparece — sempre cards empilhados.
- **Buscar e filtrar**: digitar no campo de busca filtra por nome do candidato/placa em tempo real (debounce). Filtro por tipo de veículo via faceted-filter (desktop) / sheet de filtros (mobile). Contagem no subcabeçalho reflete o resultado filtrado ("X candidaturas pendentes"). Filtros ativos ficam visíveis como chips com "limpar".
- **Conferir documento (inline)**: clicar em "CRLV"/"CNH" abre o `DocumentPreview` sobre a tela (sheet lateral no desktop, sheet full no mobile) com o documento renderizado a partir da signed URL — a pessoa confere e fecha sem perder o lugar na fila. Estado indisponível é explícito.
- **Aprovar (inline)**: botão de aprovar na linha/card/cockpit → estado `pending` no botão → sucesso remove o item da fila com microtransição e toast (`sonner`); a contagem decrementa. Sem diálogo (ação positiva e reversível pela natureza do fluxo de reingresso).
- **Rejeitar (inline)**: abre `Dialog` de confirmação (ação destrutiva, "não pode ser desfeita"), como já existe hoje; ao confirmar, remove da fila + toast.
- **Ações em lote**: selecionar cards/linhas revela a `BulkActionBar` fixa (contagem + Aprovar/Rejeitar). Rejeitar em lote exige confirmação em `Dialog`. Feedback agregado por toast ("N aprovadas"), com tratamento de falhas parciais.
- **Cockpit — varredura**: selecionar um item na lista carrega detalhe + documento no painel; ações Aprovar/Rejeitar no painel avançam automaticamente para o próximo item da fila. Atalhos de teclado (ex.: `j/k` navegar, `a` aprovar, `r` rejeitar) para triagem sem mouse.

## Responsive Behavior

- **Mobile (< `sm`)**: sempre lista de **cards empilhados** (1 coluna). Sem view-mode switcher. Filtros num `Sheet` acionado por botão "Filtros" (mostra badge com nº de filtros ativos); busca visível no topo. Ações inline em botões de toque generosos (mín. ~44px). Seleção em lote via toque longo/checkbox no card; `BulkActionBar` fixa no rodapé. `DocumentPreview` em sheet full-screen. Barra de ação e header sticky para não perder acesso às ações ao rolar.
- **Tablet (`sm`–`lg`)**: cards em grid de 2 colunas ou tabela conforme o modo; filtros começam a caber numa barra inline. Cockpit disponível a partir de largura suficiente para split (senão degrada para cards + preview em sheet).
- **Desktop (≥ `lg`)**: os 3 modos disponíveis. Tabela densa com colunas completas + view-options; Cards em grid 2–3 colunas; Cockpit em split (fila ~1/3, detalhe ~2/3). Barra de filtros completa e persistente. `DocumentPreview` como sheet lateral que não cobre a fila inteira.
- Componentes que **mudam de comportamento** (não só tamanho): filtros (sheet ↔ barra inline), seleção em lote (toque ↔ checkbox+hover), preview de documento (full-screen ↔ painel lateral), e o próprio modo de visualização (fixo em cards ↔ escolhível).

## Accessibility Requirements

- **Contraste**: mínimo WCAG AA — texto normal ≥ 4.5:1, texto grande/ícones de UI ≥ 3:1. Não sinalizar estado só por cor (tipo de veículo, disponibilidade de doc): usar rótulo/ícone junto. Validar em light e dark.
- **Teclado**: toda ação alcançável por teclado — navegação de linhas/cards, abrir preview, aprovar, rejeitar, selecionar em lote, alternar visualização e aplicar filtros. Atalhos do cockpit são adição, não substituto do tab-order. Ordem de foco lógica e visível (`ring`).
- **Foco e diálogos**: `Dialog`/`Sheet` com focus trap, retorno de foco ao gatilho no fechamento, e fechar com `Esc`. `BulkActionBar` que aparece deve ser anunciada e alcançável na ordem de tab.
- **Leitor de tela**: tabela com cabeçalhos associados; cards como itens de lista com nome do candidato como rótulo acessível; botões de ação com nome que inclui o contexto ("Aprovar candidatura de {nome}", como já feito hoje). Resultado de ações (aprovado/rejeitado, contagem, erros) anunciado via região `aria-live` além do toast.
- **Toque**: alvos ≥ 44×44px no mobile; espaçamento suficiente entre Aprovar e Rejeitar para evitar toque acidental na ação destrutiva.
- **Movimento**: transições de remoção/entrada respeitam `prefers-reduced-motion`.

## Out of Scope

- Gestão de **frota ativa** (motoristas/veículos já aprovados), histórico de candidaturas resolvidas e métricas — este brief cobre **apenas a fila de pendentes**.
- Fluxo de **criação** de candidatura (`/dashboard/config/fleet/new`) e o formulário `register-as-driver-form` — permanecem como estão.
- Mudanças de **backend/schema**: actions, services, repos, DTO (`PendingDriverApplicationDTO`), RLS e migrations. O redesign consome os dados já expostos; qualquer novo dado necessário (ex.: paginação server-side) é decisão separada.
- **Notificações/e-mail** ao candidato após aprovação/rejeição.
- Reformulação do **shell do dashboard** (sidebar, header, tema).
- Definição final dos **atalhos de teclado** do cockpit (proposta indicativa; a ergonomia exata fica para a fase de IA/protótipo).

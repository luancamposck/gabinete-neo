# Design Review: Fila de Candidaturas de Frota (`/dashboard/config/fleet`)

Reviewed against: `DESIGN_BRIEF.md` + `DESIGN_TOKENS.md`
Philosophy: Functional institutional / "quiet admin" (Dieter Rams)
Date: 2026-07-18

## Screenshots Captured

Nenhum. A captura ao vivo é obrigatória neste skill, mas **não foi possível**:
o app não sobe nesta branch (`db/refactor-migrations`) — a camada `server/`
está mid-refactor (RPCs `approve_driver_application`/`register_driver_application`
ausentes nos tipos/DB), então a página não carrega dados reais; e não há
Playwright/browser MCP disponível nesta sessão. Esta review é **por código**,
com validação estática dos pontos verificáveis. Assim que as migrations
estiverem aplicadas, rodo `/verify` e capturo os 3 breakpoints em light/dark.

## Summary

A implementação está fiel ao brief e reaproveita bem o design system (Explorer +
data-table, tokens de status, motion). Os 5 problemas reais concentram-se em
**layout responsivo do cockpit** e em **um glitch da busca** — todos corrigíveis
com ajustes pequenos e compatíveis com tokens/componentes atuais. O achado de
maior impacto é o cockpit quebrar em largura de tablet (iframe colapsa).

## Must Fix

1. **Busca com altura transbordando (glitch visível no controle primário).**
   Em [`applications-toolbar.tsx`](../../src/modules/fleet/shared/ui/applications/applications-toolbar.tsx),
   o `InputGroup` recebe `h-8` (32px), mas o `InputGroupInput` renderiza o `Input`
   base que tem altura intrínseca `h-9` (36px) e não a sobrescreve → o input fica
   mais alto que a borda do grupo, "vazando" ~4px.
   _Fix:_ forçar o controle a `h-8` (fica alinhado com o botão de filtro, que é `h-8`):
   ```tsx
   <InputGroupInput className="h-8" placeholder="Buscar por nome ou placa..." ... />
   ```

2. **Cockpit quebra em largura de tablet (768–1023px): o visualizador de documento colapsa.**
   Em [`application-review-cockpit.tsx`](../../src/modules/fleet/shared/ui/applications/application-review-cockpit.tsx),
   a altura fixa e as 2 colunas são só `lg:` (`lg:h-[72vh] lg:grid-cols-[...]`).
   Abaixo de `lg` o container fica com altura `auto`, então a área do iframe
   (`flex-1` + `size-full`) não tem espaço para crescer e renderiza com ~0px —
   o documento some. O switcher de modo aparece a partir de `!isMobile` (≥768px),
   então dá para selecionar o cockpit exatamente nessa faixa quebrada.
   _Fix (baixo risco, CSS):_ garantir altura mínima ao painel do documento para
   funcionar empilhado também — na área do iframe e no fallback vazio:
   ```tsx
   <div className="min-h-[20rem] min-h-0 flex-1 bg-muted/40"> {/* iframe */}
   ```
   _(alternativa mais estrita, alinhada ao brief: restringir o cockpit a `lg+` —
   `hidden lg:inline-flex` no `TabsTrigger value="cockpit"` + cair para "cards"
   quando `viewMode==="cockpit"` e largura < lg.)_

## Should Fix

3. **Cockpit em desktop: a barra Aprovar/Rejeitar pode ficar abaixo da dobra.**
   O painel usa `lg:h-[72vh]`; somando header do dashboard + header da página +
   toolbar + contagem (~240px) a uma viewport de 800px, o total passa de 100vh e a
   barra de ação (no rodapé do painel) exige rolar a página — atrito no modo que
   deveria ser o mais rápido ("despachar sem navegar").
   _Fix:_ dimensionar a altura descontando o chrome, com piso:
   ```tsx
   <div className="grid gap-4 lg:h-[calc(100dvh-13rem)] lg:min-h-[32rem] lg:grid-cols-[minmax(260px,320px)_1fr]">
   ```

4. **Cockpit: o item ativo não entra em vista ao navegar (`j`/`k`) ou ao auto-avançar.**
   Ao percorrer a fila com teclado ou após aprovar/rejeitar (avança de índice), o
   destaque `bg-accent` pode sair da área visível do rail (que tem `overflow-y-auto`),
   fazendo a pessoa "perder" a candidatura ativa.
   _Fix:_ `ref` no item ativo + `scrollIntoView({ block: "nearest" })` num efeito
   disparado por `safeIndex`:
   ```tsx
   const activeItemRef = useRef<HTMLLIElement>(null)
   useEffect(() => { activeItemRef.current?.scrollIntoView({ block: "nearest" }) }, [safeIndex])
   // ...<li ref={isActive ? activeItemRef : undefined} key={row.id}>
   ```

5. **Tabela densa demais (10 colunas) → scroll horizontal já em tablet/desktop pequeno.**
   Contradiz "escaneável/rápido". `overflow-x-auto` evita o vazamento, mas a leitura
   sofre. Modelo/Ano/Cor raramente são decisivos na triagem.
   _Fix:_ ocultar `vehicleYear` e `vehicleColor` por padrão (usuário reativa via
   view-options), no `initialState` de [`applications-explorer.tsx`](../../src/modules/fleet/shared/ui/applications/applications-explorer.tsx):
   ```tsx
   initialState: {
     sorting: [{ id: "createdAt", desc: false }],
     columnVisibility: { vehicleYear: false, vehicleColor: false }
   }
   ```

## Could Improve

- **Barra de ações em lote (sticky) pode cobrir o último card/linha e a paginação**,
  pois nada reserva espaço para ela. Sugestão: adicionar `pb-20` à área da lista
  quando `selectedIds.length > 0`.
- **Badge de tipo no rail do cockpit** usa `px-1.5 py-0`, deixando o texto um pouco
  apertado verticalmente. Sugestão: `py-0.5` ou remover o override.

## What Works Well

- Reuso fiel do padrão `Explorer` + `data-table` (seleção unificada por `getRowId`,
  faceted filter, paginação, persistência) — consistente com `UsersExplorer`.
- Tokens de status aplicados como **informação** (success no aprovar, warning na
  urgência, info em "nova"), exatamente como no brief; nada hardcoded.
- Aprovar sem diálogo / rejeitar com diálogo implementados de forma coerente nas
  três views + lote, com `motion-reduce` nas transições.
- O cockpit é uma boa materialização do 3º modo original (documento sempre à vista,
  auto-avanço, atalhos) — os ajustes acima são de robustez, não de conceito.

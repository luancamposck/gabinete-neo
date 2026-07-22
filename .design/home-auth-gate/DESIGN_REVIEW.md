# Design Review: Home / Gate de Autenticação (`/`)

Reviewed against: DESIGN_BRIEF.md
Philosophy: Institucional confiável (restraint funcional sobre o sistema navy existente)
Date: 2026-07-22

## Screenshots Captured

Nenhum screenshot ao vivo foi capturado nesta rodada: o dev server não estava em
execução (instrução prévia de não subir o dev) e o MCP Playwright estava
indisponível/reconectando. Esta review é baseada em análise de código. Os
achados principais são estruturais e não dependem de captura — mas uma segunda
passada com screenshots é recomendada após aplicar os fixes.

## Summary

O feedback do usuário está correto: **o resultado lê como "removeram o Vortex",
não como um redesign.** As mudanças entregues foram majoritariamente
comportamentais/estruturais (scroll natural, tabs controladas, toggle de tema,
troca do canvas por fundo estático, logo mobile menor) — todas legítimas e no
brief — mas o **vocabulário visual permaneceu ~90% igual**: mesmo card, mesmas
tabs, mesmo painel `bg-muted`, mesma hierarquia. O erro de calibragem está no
fundo da marca: os tints têm chroma tão baixo (0.006–0.02) que na tela o
gradiente é imperceptível, virando um fundo liso. O redesign não "falha" — ele
é tímido demais para ser percebido como redesign.

Importante: dá para aumentar muito o impacto visual **sem violar** as restrições
acordadas (não substituir o tema global, não criar estética isolada, só estender
tokens). As alavancas abaixo são todas derivadas dos tokens existentes.

## Must Fix

1. **Fundo da marca é imperceptível** — `auth-background.tsx` + tokens
   `--auth-gradient-*` (globals.css). Chroma 0.006–0.02 no light lê como branco
   chapado; o `--auth-glow` a 8% some. _Fix: subir a presença — chroma ~0.04–0.08
   nos stops, dois focos radiais (um `--primary`/`--info`, outro `--chart`) para
   um efeito aurora/mesh sutil porém visível, ainda 100% derivado de tokens.
   Testar que o card mantém contraste AA por cima._

2. **Painel de identidade (desktop) sem peso** — `auth-tabs-client.tsx`. Continua
   `bg-muted` (near-white no light) com logo+nome+glow fraco: visualmente quase
   igual ao form ao lado, então o card parece "um retângulo claro dividido". _Fix:
   transformar num painel de marca sólido e escuro (o padrão "split auth"
   institucional): fundo navy profundo com o nome/logo em contraste claro. Como
   `bg-primary` **inverte no dark** (vira near-white), NÃO usar `bg-primary`;
   adicionar um token aditivo `--auth-panel` / `--auth-panel-foreground` que seja
   navy profundo nos dois temas. Isso é a maior mudança de percepção com o menor
   custo, e não cria estética nova — é o mesmo navy do tema._

## Should Fix

3. **Hierarquia tipográfica dos forms inalterada** — `sign-in-form.tsx`,
   `register-and-join-form.tsx`. Títulos `text-2xl font-bold` genéricos; nada
   diferencia a tela do template shadcn base. _Fix: um passo de hierarquia mais
   deliberado (título maior/mais tight com `tracking-tight`, subtítulo em
   `text-muted-foreground` com medida controlada), reforçando o tom institucional._

4. **Card sem tratamento de elevação/borda intencional** — o card usa o default.
   Sobre um fundo agora mais presente, ele precisa de uma âncora visual clara.
   _Fix: borda/elevação sutil coerente com os tokens de shadow, cantos alinhados
   ao `--radius`; considerar `backdrop-blur` leve como a `/lp` já faz (consistência
   com o produto)._

5. **Wizard de cadastro não recebeu atenção mobile** — `register-and-join-form.tsx`.
   Funciona (grids colapsam), mas o stepper e o espaçamento são os originais; o
   brief pedia "redesenhar para fluir bem no mobile". _Fix: revisar densidade e o
   indicador de passos em telas estreitas (o fix de scroll ajudou, mas o visual do
   stepper é o mesmo)._

## Could Improve

6. **Transição entre tabs**: sem animação de troca; um cross-fade curto
   respeitando `prefers-reduced-motion` daria polish (usar `--duration-fast` /
   `--ease-standard` que já existem).

7. **Toggle de tema**: `ghost` solto no canto pode sumir sobre o gradiente mais
   forte; considerar um leve fundo/borda para garantir alvo e contraste.

8. **Glow do painel e do fundo** poderiam compartilhar um mesmo foco de luz para
   dar coesão (a luz "vem do mesmo lugar").

## What Works Well

- **Decisões estruturais estão certas**: scroll natural (fim do topo cortado),
  tabs controladas (link "Cadastre-se" e `?ref` funcionando), toggle de tema,
  e a troca do canvas por CSS estático (perf + Firefox + reduced-motion). Isso é
  fundação sólida — o problema é só a camada visual por cima.
- **Disciplina de tokens**: nada hardcoded, extensão aditiva limpa, sem estética
  isolada. A restrição foi respeitada — agora é usá-la com mais coragem.
- **Organização de arquivos**: separação server/client correta, componentes no
  módulo certo, skeleton alinhado ao novo layout.
```

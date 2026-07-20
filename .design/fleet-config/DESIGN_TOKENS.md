# Design Tokens — Fleet Config (extensão)

> **Regra desta feature:** _somente extensões_ ao tema global existente
> (`src/app/globals.css`). Nenhum token existente foi substituído, nenhuma
> estética isolada foi criada. Os componentes desta tela usam os tokens
> semânticos do shadcn/ui já presentes (`bg-card`, `text-muted-foreground`,
> `border`, `bg-primary`, etc.) + as extensões abaixo.

Derivado da filosofia do brief: **Functional institutional / "quiet admin"**.
Stack: Tailwind v4 + shadcn/ui (new-york, base slate), tokens em OKLCH,
dark mode via classe `.dark` (next-themes). Sem `tailwind.config`.

## O que NÃO foi adicionado (de propósito)

- **Spacing** — o projeto usa a escala default do Tailwind. Adicionar um
  `--space-*` paralelo criaria um sistema concorrente. Usar `p-4`, `gap-2`,
  `space-y-6` etc. como o resto do dashboard.
- **Typography** — Geist Sans/Mono + escala `text-*` do Tailwind já cobrem.
  Manter o padrão de página: título `text-2xl font-semibold tracking-tight`,
  descrição `text-sm text-muted-foreground`.
- **Radius / breakpoints / cores base** — já existem (`--radius`, `xs: 425px`,
  paleta completa light/dark). Reutilizar.

## O que foi adicionado

### 1. Cores de status (semânticas)

Só existia `--destructive` (base). Foi adicionada uma família de status
consistente com **contrato de 4 partes** cada:

| Papel | Uso |
| --- | --- |
| `*` (base) | Fill sólido (botão, ícone, texto colorido sobre superfície neutra) |
| `*-foreground` | Texto/ícone **sobre** o fill sólido |
| `*-subtle` | Fundo tingido para badges, wells, realce de linha |
| `*-subtle-foreground` | Texto/ícone **sobre** o fundo subtle |

Status e mapeamento para a feature:

| Token | Cor | Uso na tela |
| --- | --- | --- |
| `success` | verde sóbrio | Botão **Aprovar**, toast de sucesso, estado "aprovada" |
| `warning` | âmbar | Badge de **urgência** (candidatura envelhecendo por data) |
| `info` | azul (família slate) | Dicas neutras, contadores/realces informativos |
| `destructive` | vermelho (base já existia) | **Rejeitar** — agora com `-foreground`/`-subtle` completos |

Utilitários Tailwind gerados: `bg-success`, `text-success`,
`bg-success-subtle`, `text-success-subtle-foreground`, `border-success`, …
(idem `warning`, `info`, e os novos de `destructive`).

**Exemplos de uso**
- Botão Aprovar (sólido): `bg-success text-success-foreground hover:bg-success/90`
- Badge urgência: `bg-warning-subtle text-warning-subtle-foreground`
- Rejeitar destrutivo: já via `variant="destructive"` do `Button`; badges de
  erro podem usar `bg-destructive-subtle text-destructive-subtle-foreground`

Valores light/dark definidos em `:root` e `.dark`. Dark **não é inversão**:
L mais claro e chroma levemente menor, seguindo o padrão que o próprio
`--destructive` já usava entre os dois temas. Contraste alvo ≥ AA
(texto sobre fill e sobre subtle validados em ambos os temas).

### 2. Motion (independente de tema)

O tema não tinha nenhuma escala de movimento. Adicionado (em `:root`,
uma vez só):

| Token | Valor | Uso |
| --- | --- | --- |
| `--duration-fast` | 150ms | Hover, toggle de modo de visualização, seleção |
| `--duration-normal` | 250ms | Entrada/saída de item da fila, troca de painel no cockpit |
| `--duration-slow` | 400ms | Transições maiores/sheets |
| `--ease-standard` | `cubic-bezier(0.2, 0, 0, 1)` | Entradas (utilitário `ease-standard`) |
| `--ease-exit` | `cubic-bezier(0.4, 0, 1, 1)` | Saídas/remoção (utilitário `ease-exit`) |

Uso: `ease-standard` / `ease-exit` como utilitário; durações via arbitrary
value, ex.: `duration-[var(--duration-normal)]`. Toda animação de
entrada/saída deve respeitar `motion-reduce:transition-none` (ou
`prefers-reduced-motion`), conforme o brief.

## Localização

Tudo em `src/app/globals.css`, dentro dos blocos já existentes:
`@theme inline` (mapeamentos + easings), `:root` (light + durações),
`.dark` (dark). Nenhum arquivo novo de tema; nenhum `[data-theme]`
introduzido (o projeto usa `.dark`).

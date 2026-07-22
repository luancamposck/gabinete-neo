# Design Brief: Home / Gate de Autenticação (`/`)

## Problem

Uma pessoa abre a URL do gabinete para **entrar na conta** ou **se cadastrar**. Hoje ela encontra uma tela que parece um template genérico — o mesmo bloco de "abas de login" que se vê em qualquer lugar — sobre um fundo de partículas que não diz nada sobre aquele gabinete específico. No celular, onde boa parte dos apoiadores acessa, a experiência trava: o cartão de cadastro é alto, fica centralizado verticalmente e **tem o topo cortado**, obrigando a pessoa a lutar com o scroll para preencher os campos. O fundo animado ainda consome bateria e processamento, e simplesmente não aparece em alguns navegadores. O resultado é uma primeira impressão fraca e uma tarefa simples (entrar) que dá trabalho.

## Solution

Uma tela de acesso **enxuta, confiável e centrada na tarefa**, que funciona igualmente bem no celular e no desktop. Substituímos o efeito de partículas por um fundo derivado das cores da marca do próprio gabinete (white-label), calmo e sem custo de performance. O cartão de autenticação deixa de ser centralizado à força e passa a **rolar naturalmente** quando o conteúdo é alto, garantindo que nenhum campo fique inacessível. Login e Cadastro continuam em abas, o cadastro segue em dois passos (dados + endereço), mas o wizard é redesenhado para caber e fluir bem em telas pequenas. A identidade do tenant (logo + nome) aparece de forma proporcional e elegante, sem dominar a dobra do mobile.

## Experience Principles

1. **A tarefa acima do ornamento** — entrar e cadastrar é o objetivo; todo elemento visual serve a essa ação ou sai da frente. O fundo é ambiente, nunca protagonista.
2. **Mobile é o caso base, não a adaptação** — o layout é pensado primeiro para a tela pequena (scroll natural, alvos de toque, um campo por vez quando faz sentido); o desktop é o enriquecimento.
3. **Confiança pela marca, não pelo efeito** — a credibilidade vem da consistência com os tokens do design system e a identidade do gabinete, não de animações. Sóbrio, institucional, previsível.

## Aesthetic Direction

- **Philosophy**: Institucional confiável — "nível instituição", em linha com o discurso de segurança/transparência já usado na landing `/lp`. Superfícies limpas, hierarquia tipográfica clara, um acento de cor derivado da marca.
- **Tone**: Sério, acolhedor e competente. Transmite "sua campanha/gabinete está em boas mãos" sem ser corporativo frio.
- **Reference points**: Telas de acesso de produtos SaaS maduros (Linear, Vercel, Notion) — cartão focado sobre fundo tranquilo; a própria `/lp` deste projeto (navy dos tokens + acentos discretos, cards com `backdrop-blur`).
- **Anti-references**: O visual atual de "template de partículas" (Aceternity Vortex); qualquer coisa que pareça landing de marketing (isso é papel do `/lp`); gradientes berrantes ou movimento chamativo; azul `hue 200` hardcoded desconectado dos tokens.

## Existing Patterns

Componentes, tokens e convenções já no código que este design deve respeitar e estender.

- **Typography**: Geist Sans (`--font-geist-sans`) e Geist Mono, carregadas via `next/font` no [layout](src/app/layout.tsx). Títulos usam `font-bold`/`font-semibold`; texto de apoio em `text-muted-foreground`.
- **Colors**: Tokens shadcn em OKLCH no [globals.css](src/app/globals.css), com dark mode via classe `.dark`. `--primary` é um navy quase-preto; paleta de charts (`--chart-1..5`) e família de status (`--success/--warning/--info` com variantes `-subtle`) disponíveis. Fundo da marca deve ser derivado **desses tokens**, nunca de cores fixas.
- **Spacing**: Escala Tailwind padrão; página usa `p-6 md:p-10`. Breakpoint custom `xs: 425px` disponível.
- **Motion**: Tokens `--ease-standard`, `--ease-exit` e durações `--duration-fast/normal/slow`. Biblioteca `motion` (Framer) já instalada. Toda animação nova deve respeitar `prefers-reduced-motion`.
- **Components**: `Tabs`, `Card`, `Button`, `Input`, `Field`/`FieldGroup`/`FieldError`, `InputGroup`, `Select`, `Combobox`, `Skeleton` (todos em `src/shared/components/ui/`). `ModeToggleButton` e `ThemeProvider` (next-themes) já existem. `AuthTabs`, `SignInForm` e `RegisterAndJoinForm` são o ponto de partida a ser redesenhado, não substituído.

## Component Inventory

| Component | Status | Notes |
| --------- | ------ | ----- |
| `HomePage` (page.tsx) | Modify | Trocar `justify-center` por layout que permite scroll; remover `<Vortex>`; inserir fundo da marca. |
| Fundo da marca (novo) | New | Gradiente/superfície estática derivada de `--primary`/`--chart`, theme-aware, sem canvas/rAF. Substitui `Vortex` nesta rota. |
| `Vortex` | Exists | **Não** usado na home após o redesign. Permanece disponível para outros usos; não remover o arquivo. |
| `AuthTabs` | Modify | Redesenhar hierarquia; corrigir logo mobile (`w-3/4` → tamanho proporcional); revisar painel de branding desktop. |
| `SignInForm` | Modify | Ajustes visuais/espaçamento; corrigir link "Cadastre-se" (hoje `href="#"`); consistência com o design novo. |
| `RegisterAndJoinForm` | Modify | Redesenhar o wizard de 2 passos para mobile: indicador de passo, alvos de toque, evitar overflow; manter os campos. |
| Indicador de passos | Modify | O stepper atual (1 Usuário / 2 Endereço) precisa funcionar bem em largura pequena. |
| `AuthTabsSkeleton` | Modify | Manter alinhado ao novo layout para não haver "salto" no carregamento. |
| `ModeToggleButton` | Exists / Reuse | Considerar disponibilizar o toggle de tema na tela de acesso. |
| Logo do tenant (`next/image`) | Reuse | Já dinâmico via `getCurrentOrganizationAction`; ajustar dimensionamento responsivo. |

## Key Interactions

- **Alternar Login ↔ Cadastro**: abas (`Tabs`) trocam o conteúdo do cartão. A troca não deve causar salto de altura brusco nem reposicionar a viewport de forma desorientadora.
- **Wizard de cadastro (passo 1 → 2)**: ao avançar, valida os campos do passo atual (`trigger`) e só então navega; erros focam o primeiro campo inválido. O indicador de passos reflete o progresso. "Voltar" preserva o que foi preenchido.
- **Autofill de CEP**: no blur do CEP válido, busca o endereço (ViaCEP) e preenche rua/bairro/estado como somente-leitura, com foco automático em "Número". Estados de loading e erro (toast) já existem — o design deve acomodar o estado `disabled`/`readOnly` visualmente.
- **Submit**: botões mostram estado de carregando ("Entrando..." / desabilitado); feedback por toast (`sonner`, `richColors`). Sucesso redireciona para `/dashboard`.
- **Fundo**: puramente ambiente — sem interação, sem reação a input, sem animação perceptível (ou animação mínima que respeita `prefers-reduced-motion`).

## Responsive Behavior

- **Mobile (base, < `md`)**: coluna única. Logo do tenant em tamanho **proporcional e discreto** (não `w-3/4`). O cartão **não** é centralizado à força — a página permite scroll vertical quando o conteúdo (especialmente o cadastro) excede a altura; o topo do formulário nunca fica inacessível. Padding externo reduzido para maximizar área útil. Alvos de toque ≥ 44px. O passo de endereço empilha os campos que hoje usam grid `md:grid-cols-2/3`.
- **Desktop (≥ `md`)**: layout de dois painéis do `AuthTabs` (formulário + painel de identidade do gabinete) preservado e refinado. O fundo da marca aparece atrás/ao redor do cartão. Largura máxima controlada (`max-w-3xl` atual como referência).
- **Componente que muda de comportamento (não só tamanho)**: o painel de branding lateral (`md:` apenas) → no mobile vira um cabeçalho compacto de logo+nome no topo do cartão, não um bloco separado gigante.

## Accessibility Requirements

- **Contraste**: texto e componentes ≥ WCAG AA (4.5:1 texto normal, 3:1 texto grande/UI). O fundo da marca **não pode** reduzir o contraste do cartão ou dos campos em nenhum tema — validar em light e dark.
- **Teclado**: ordem de foco lógica (abas → campos → ações); wizard navegável só por teclado; foco visível usando o token `--ring` (o `outline-ring/50` base já existe).
- **Reduced motion**: qualquer transição de aba/passo e o fundo devem respeitar `prefers-reduced-motion: reduce` — sem movimento perceptível quando solicitado. (O `Vortex`, que não respeitava isso, sai da rota.)
- **Formulários**: labels associadas (`htmlFor`/`id` via `useId` já em uso), `aria-invalid` nos campos, mensagens de erro programaticamente ligadas (`FieldError`). Estados `readOnly`/`disabled` do autofill de CEP anunciados corretamente.
- **Screen reader**: passos do wizard anunciados (ex.: "Passo 1 de 2"); logo com `alt` = nome da organização (já feito).
- **Consistência entre navegadores**: a experiência não pode depender de recurso que "some" em alguns navegadores (como o `Vortex` fazia no Firefox).

## Out of Scope

- A landing de marketing `/lp` — não é tocada; a home continua sendo apenas o gate de autenticação.
- Fluxos de `/forgot-password` e `/reset-password` — só garantir que os links da home apontem corretamente.
- Lógica de autenticação, validações Zod, action de cadastro e integração ViaCEP — comportamento mantido; mudanças são de apresentação/layout.
- Redução ou reordenação dos campos de cadastro — os 2 passos (dados + endereço) permanecem como estão; coletar endereço pós-login **não** faz parte deste escopo.
- Remoção do componente `Vortex` do projeto — ele apenas deixa de ser usado nesta rota.
- Onboarding pós-login e qualquer tela dentro de `/dashboard`.
```

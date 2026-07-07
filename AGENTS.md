# AGENTS.md

## Objetivo
Este arquivo define regras e padrões para agentes (Codex/Claude/etc.) trabalharem neste repositório com consistência, qualidade e segurança.

---

## Comandos do projeto (fonte da verdade)

- Instalar dependências: `npm install`
- Rodar dev: `npm run dev`
- Build: `npm run build`
- Start: `npm run start`
- Lint (check): `npm run lint:biome`
- Lint + fix: `npm run fix:biome`
- Typecheck: `npm run typecheck`
- Adicionar componente shadcn/ui: `npm run ui:add`
- Supabase start: `npm run supabase:start`
- Supabase stop: `npm run supabase:stop`
- Supabase status: `npm run supabase:status`
- Nova migration Supabase: `npm run db:migration:new`
- Aplicar migrations locais Supabase: `npm run db:migration:up`
- Resetar DB local Supabase: `npm run db:reset`
- Gerar tipos Supabase locais: `npm run db:gen-types`

Antes de finalizar uma tarefa (ou abrir PR), rode:
`npm run fix:biome && npm run lint:biome && npm run typecheck`

---

## Arquitetura Backend

- Fluxo padrão (casos simples): `Action -> Service -> Repo`
- Fluxo para casos complexos/orquestração: `Action -> Use-case -> Service(s) -> Repo(s)`
- Use Use-case apenas quando há orquestração de múltiplos passos, branching (validações + side effects + auditoria) ou necessidade de consistência entre múltiplas operações.
- Cada camada só chama a camada permitida (Action -> Service/Use-case, Use-case -> Service(s), Service -> Repo(s), Repo -> Supabase); Service não chama Service, e Action/Use-case não acessam Repo/Supabase diretamente.
- Para a tabela completa de responsabilidades por camada (o que cada uma pode/não pode fazer) e o detalhe de cada camada, ver `docs/standards/backend-layers.md`.

---

## Estrutura real de pastas (feature-first)

### Nosso padrão (usar)
- Services:
  - `src/modules/<module-name>/server/services/<service-name>.service.ts`
- Repos:
  - `src/modules/<module-name>/server/repos/<repo-name>.repo.ts`
  - se precisar de supabaseAdmin:
    - `src/modules/<module-name>/server/repos/<repo-name>.admin.repo.ts`
- Actions (Server Actions):
  - `src/modules/<module-name>/server/actions/<action-name>.action.ts`
- Use-cases:
  - `src/modules/<module-name>/server/use-cases/<use-case-name>.use-case.ts`

Exemplo real:
- `src/modules/auth/server/use-cases/create-user.use-case.ts`

Estrutura base (server) por módulo:
- `src/modules/<module-name>/server/repos/...`
- `src/modules/<module-name>/server/services/...`
- `src/modules/<module-name>/server/actions/...`
- `src/modules/<module-name>/server/use-cases/...`

### Legado (não usar em código novo)
Módulos mais antigos ainda organizam actions e use-cases dentro de `slices/<slice-name>/`:
- `src/modules/<module-name>/server/slices/<slice-name>/actions/<action-name>.action.ts`
- `src/modules/<module-name>/server/slices/<slice-name>/use-cases/<use-case-name>.use-case.ts`

Exemplos reais (legado):
- `src/modules/auth/server/slices/sign-in/actions/sign-in.action.ts`
- `src/modules/auth/server/slices/dashboard-guard/actions/require-dashboard-access.action.ts`

Não criar novas `slices/` em código novo — usar o padrão flat acima. Não é necessário migrar código legado existente como parte de outras tarefas.

Estrutura base (shared/ui) por módulo:
- `src/modules/<module-name>/shared/ui/...`
- usar essa pasta para componentes reutilizáveis que pertencem apenas a um módulo
- manter em `src/shared/components/ui/` apenas primitives/base UI compartilhadas do design system (shadcn/ui)
- usar `src/shared/components/` para componentes compostos globais/cross-module

---

## Regras de naming

- Arquivos devem seguir os sufixos `.action.ts`, `.service.ts`, `.repo.ts`, `.use-case.ts`.
- Funções devem usar o sufixo da camada: `Action`, `Service`, `Repo`, `UseCase`.
- Repos usam verbos de persistência.
- Services usam verbos de negócio.
- Para a tabela completa de verbos, ver `docs/standards/naming.md`.

---

## Contratos de retorno

- Services e Use-cases retornam `AppResultAsync<T, E>` (sem `message`); Actions/Route Handlers/Presenters retornam `OperationResponse<T, E>` (com `message`).
- `code` é contrato interno estável; `message` é apresentação para usuário.
- `MSG_*` fica só na borda pública; Services, Use-cases e Repos não declaram `MSG_*` nem retornam `message`.
- Actions traduzem `code` interno para `message`.
- Tipos globais ficam em `src/shared/types/`.
- Para tipos completos, tabela por camada e exemplo, ver `docs/standards/result-contracts.md`.

---

## Supabase (clientes e regras)

- Clientes Supabase ficam em `src/lib/supabase/{admin,middleware,server}.ts`.
- **Nunca** usar `supabaseAdmin` em código client.
- Repos que precisam de admin devem ser separados em `*.admin.repo.ts`.
- RLS é obrigatória para tabelas novas multi-tenant.
- Toda tabela multi-tenant deve ter `organization_id`, salvo exceção explicitamente documentada.
- Mudanças de schema devem considerar no mesmo ciclo: constraints, indexes, RLS, policies, triggers necessários e types gerados.
- Para regras completas de database, migrations, RLS, clientes Supabase e naming SQL, ver `docs/standards/database-and-rls.md`.

---

## Next.js (App Router) — regras importantes

- Manter em `src/app/` apenas arquivos de entrada do App Router:
  - exemplos: `page.tsx`, `layout.tsx`, `route.ts`, `route.tsx`
- Arquivos especiais do Next.js/App Router também podem existir em `src/app/`:
  - exemplos: `loading.tsx`, `error.tsx`, `not-found.tsx`, `template.tsx`, `default.tsx`, `globals.css`, `favicon.ico`
- Não criar componentes de domínio, services, helpers, validações ou lógica de aplicação dentro de `src/app/`.
- Não criar pastas como `_components/` dentro de `src/app/` para armazenar componentes de domínio.
- A lógica deve ficar nos módulos em `src/modules/` e `src/shared/`; `src/app/` deve apenas compor e conectar as rotas.
- `page.tsx` e `layout.tsx` devem ser **Server Components** por padrão (evitar `"use client"`).
- Se precisar de client, criar wrapper separado:
  - `page.tsx` (server) renderiza `<SomeClientComponent />` em arquivo com `"use client"`.
- Código em `server/` é server-only:
  - Não importar repos/services/use-cases em componentes client.
- Variáveis de ambiente:
  - Server: `process.env.*`
  - Client: apenas `NEXT_PUBLIC_*`
- Dados sensíveis devem ser resolvidos no server (Server Actions/Route Handlers), não em fetch client.

---

## `src/lib/` vs `src/shared/` — separação de responsabilidade

### `src/lib/` — wrappers de terceiros (somente inicialização de infra)
Contém **apenas** inicialização/configuração de bibliotecas externas. Sem lógica de aplicação.

- `src/lib/supabase/` — clientes Supabase (admin, server, middleware)
- `src/lib/resend/` — cliente Resend (email)
- `src/lib/utils/cn.ts` — utilitário shadcn/ui (clsx + tailwind-merge)
- `src/lib/providers/` — wrappers de providers terceiros (ex: React Query)

> **Regra:** se não é um wrapper fino de SDK/biblioteca terceira, **não** vai em `src/lib/`.

### `src/shared/` — código cross-cutting da aplicação
Contém código compartilhado entre múltiplos módulos. Helpers puros, types, constantes, formatters, masks e utilitários de infra do app.

- `src/shared/types/` — types globais (`OperationResponse`, tipos Supabase gerados)
- `src/shared/constants/` — constantes usadas por mais de um módulo
- `src/shared/components/` — componentes compostos globais e primitives UI (ver seções abaixo)
- `src/shared/hooks/` — hooks cross-module (ex: `use-mobile`, `use-persisted-table-state`)
- `src/shared/formatters/` — funções de formatação (CEP, telefone, etc.)
- `src/shared/masks/` — funções de máscara de input (CEP, telefone, etc.)
- `src/shared/http/` — utilitários de HTTP/request (ex: extrair host)
- `src/shared/infra/` — helpers de infra do app (ex: rethrow de erros Next.js)

> **Regra:** se é usado por mais de um módulo e não é wrapper de terceiro, vai em `src/shared/`.
> Constantes ou validações específicas de **um só módulo** ficam em `src/modules/<module>/shared/`.
> Componentes de UI reutilizáveis de **um só módulo** ficam em `src/modules/<module>/shared/ui/`.

### `src/shared/components/` — UI composta global
Usar para componentes compostos de aplicação reutilizados entre múltiplas rotas ou módulos.

- Exemplo: `mode-toggle-button`, `theme-provider`, `vortex`, `waves`
- Não colocar lógica server nessa pasta; manter apenas composição visual e comportamento client/server de apresentação

### `src/shared/components/ui/` — primitives UI (shadcn/ui)
Contém todos os primitives/base UI do design system gerados pelo shadcn/ui CLI.

- Exemplo: `button.tsx`, `dialog.tsx`, `input.tsx`, `card.tsx`, `table.tsx`
- Novos componentes shadcn são gerados aqui automaticamente (`npx shadcn add <component>`)
- Componentes shadcn usam `function` declarations (exceção aceita à regra de arrow functions para React components)
- Não colocar componentes de domínio ou compostos nessa pasta; apenas primitives UI

### `src/modules/<module>/shared/ui/` — UI compartilhada por módulo
Usar para componentes visuais reutilizáveis que pertencem a um único módulo.

- Exemplo: cards, form sections, dialogs e componentes auxiliares usados só dentro de `auth`
- Não usar `src/shared/components/ui/` para UI que ainda é específica de um módulo
- Não colocar lógica server nessa pasta; manter apenas UI e helpers de apresentação específicos do módulo

### Sem barrel files
Não usar arquivos `index.ts` para re-exportar. Todos os imports devem apontar diretamente para o arquivo fonte.

---

## Organização e padrões gerais

- Use TypeScript em todos os arquivos.
- Prefira `async/await` a `.then()`.
- Use imports absolutos com alias `@/`.
- Evite `any`, `@ts-ignore` e “silenciar lint” sem necessidade real.
- Não criar novos arquivos em pastas legadas.
- Components React: `const Component = () => {}`
  - Exceção: componentes shadcn/ui em `src/shared/components/ui/` usam `function` declarations (padrão do gerador shadcn)
- Funções utilitárias normais: `function myFunction() {}`

---

## Git / Commits

- **Sempre escrever mensagens de commit inteiramente em inglês** (título, body, footer — tudo).
- Use Conventional Commits: `feat:`, `fix:`, `refactor:`, `chore:`, `test:`, `docs:`
- O título deve ser semântico, conciso e com no máximo 72 caracteres.
- Para mudanças maiores, incluir um **body topicalizado** com bullet points agrupados por área/tópico da mudança.
- **Nunca** incluir `Co-Authored-By` ou qualquer variação nos commits.
- O agente pode criar commits **pequenos e descritivos**, mas deve:
  - garantir `git diff` limpo e compreensível
  - rodar `fix:biome` antes
  - nunca commitar segredos
  - nunca dar push direto em `main/master`

---

## Segurança e ambiente

- Nunca commitar segredos (tokens/chaves).
- Se precisar de nova env var: atualizar `.env.example` e documentar rapidamente.
- Não rodar comandos destrutivos contra ambientes de produção.
- Gerar tipos do Supabase via `npm run db:gen-types` quando houver mudança de schema.

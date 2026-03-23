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
- DB push (Supabase): `npm run db:push`
- Gerar tipos Supabase: `npm run db:gen-types`

Antes de finalizar uma tarefa (ou abrir PR), rode:
`npm run fix:biome && npm run lint:biome && npm run typecheck`

---

## Arquitetura Backend

- Fluxo padrão (casos simples): `Action -> Service -> Repo`
- Fluxo para casos complexos/orquestração: `Action -> Use-case -> Service(s) -> Repo(s)`

### Quando usar Use-case
Use apenas quando:
- precisa orquestrar múltiplos passos/fluxos
- existe branching (validações + side effects + auditoria)
- precisa coordenar consistência entre múltiplas operações

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
  - `src/modules/<module-name>/server/slices/<slice-name>/actions/<action-name>.action.ts`
- Use-cases:
  - `src/modules/<module-name>/server/slices/<slice-name>/use-cases/<use-case-name>.use-case.ts`

Exemplos reais:
- `src/modules/auth/server/slices/sign-in/actions/sign-in.action.ts`
- `src/modules/auth/server/slices/dashboard-guard/actions/require-dashboard-access.action.ts`

Estrutura base (server) por módulo:
- `src/modules/<module-name>/server/repos/...`
- `src/modules/<module-name>/server/services/...`
- `src/modules/<module-name>/server/slices/<slice-name>/actions/...`
- `src/modules/<module-name>/server/slices/<slice-name>/use-cases/...`

Estrutura base (shared/ui) por módulo:
- `src/modules/<module-name>/shared/ui/...`
- usar essa pasta para componentes reutilizáveis que pertencem apenas a um módulo
- manter em `src/shared/ui/` apenas primitives/base UI compartilhadas do design system
- usar `src/shared/components/` para componentes compostos globais/cross-module

---

## Regras de naming (obrigatório)

### Arquivos
- Action: `kebab-case.action.ts`
- Service: `kebab-case.service.ts`
- Repo: `kebab-case.repo.ts`
- Admin repo: `kebab-case.admin.repo.ts`
- Use-case: `kebab-case.use-case.ts`

### Funções (padrão recomendado)
- `signInAction`, `signInService`, `signInRepo`
- `requireDashboardAccessAction`, `requireDashboardAccessUseCase`, etc.

---

## Regras de acoplamento (quem pode chamar quem)

### Permitido
- **Action** -> Service **OU** Use-case
- **Use-case** -> Service(s)
- **Service** -> Repo(s)
- **Repo** -> Supabase (somente acesso a dados)

### Proibido
- Service chamar Service (evitar dependências circulares e acoplamento)
- Action chamar Repo direto
- Use-case acessar Supabase direto (sempre via Repo)
- Repo conter regra de negócio / validação / orquestração

> Se precisar reutilizar lógica entre services, extraia para um helper puro em `src/shared/` (sem dependência de infra).

---

## Responsabilidade por camada

### Action (Server Action)
- Valida input do usuário com **Zod** antes de chamar a próxima camada.
- Chama `Service` (fluxo simples) ou `Use-case` (fluxo complexo).
- Retorna DTO específico para o cliente (não retornar entidades cruas do Supabase).
- Normaliza campos quando necessário (`snake_case` -> `camelCase`) de forma consistente.
- Deve retornar tipo explícito `OperationResponse` (em `src/shared/types/operation-response.types.ts`).

### Use-case
- Usado apenas em fluxos complexos/orquestração.
- Consome um ou mais Services.
- Retorna `OperationResponse`.

#### Padrão de mensagens e comentários em Use-case
- Todo use-case deve centralizar mensagens em constantes `MSG_*` no topo do arquivo.
- Não retornar strings inline dentro do fluxo; prefira `MSG_SUCCESS`, `MSG_UNAUTHENTICATED`, `MSG_NOT_ALLOWED`, `MSG_NOT_FOUND`, `MSG_INFRA_ERROR`, etc.
- Se o use-case expõe `infra_error`, definir também:
  - `const FALLBACK_INFRA_ERROR = { success: false, message: MSG_INFRA_ERROR, code: "infra_error" } as const`
- Todo use-case deve ter `prefixLog` no formato `"[nomeDoUseCase]:"` para logs técnicos.
- O corpo do use-case deve ser dividido em etapas comentadas e numeradas, neste formato:

```ts
// ============================================================
// 0) Descrever a etapa
//
// Possibilidades:
// - cenário 1
// - cenário 2
// ============================================================
```

- Cada bloco comentado deve explicar a intenção da etapa e os resultados esperados (`success`, códigos de erro, rollback, fallback, etc.).
- O objetivo é que qualquer pessoa entenda rapidamente o fluxo do use-case sem precisar inferir a orquestração apenas lendo os `if`s.
- Quando a mensagem final pertence ao contrato do use-case, preferir uma constante local `MSG_SUCCESS` em vez de reaproveitar diretamente a mensagem retornada por service.

### Service
- Centraliza regra de negócio.
- Consome Repo(s).
- Trata erros de forma consistente (mapear para `OperationResponse` com codes/mensagens padronizados).
- Retorna `OperationResponse`.

### Repo
- Extremamente fino.
- Apenas executa operações no Supabase e retorna o resultado tipado.
- Sem regra de negócio, validação de input ou orquestração.

---

## Supabase (clientes e regras)

Temos 3 clientes em `src/lib/supabase/{admin,middleware,server}.ts`:

- `server.ts` e `middleware.ts` usam `createServerClient` (SSR).
- `admin.ts` usa `createClient` (`@supabase/supabase-js`) com credenciais de admin.

Regras:
- **Nunca** usar `supabaseAdmin` em código client.
- Repos que precisam de admin devem ser separados em `*.admin.repo.ts`.
- Preferir o cliente `server`/SSR para operações do usuário autenticado.
- Sempre manter tipagem usando os types gerados (script `npm run db:gen-types`).

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

> **Regra:** se não é um wrapper fino de SDK/biblioteca terceira, **não** vai em `src/lib/`.

### `src/shared/` — código cross-cutting da aplicação
Contém código compartilhado entre múltiplos módulos. Helpers puros, types, constantes, formatters, masks e utilitários de infra do app.

- `src/shared/types/` — types globais (`OperationResponse`, tipos Supabase gerados)
- `src/shared/constants/` — constantes usadas por mais de um módulo
- `src/shared/ui/` — primitives/base UI compartilhadas do design system
- `src/shared/components/` — componentes compostos globais reutilizados entre múltiplas rotas/módulos
- `src/shared/formatters/` — funções de formatação (CEP, telefone, etc.)
- `src/shared/masks/` — funções de máscara de input (CEP, telefone, etc.)
- `src/shared/http/` — utilitários de HTTP/request (ex: extrair host)
- `src/shared/infra/` — helpers de infra do app (ex: rethrow de erros Next.js)
- `src/shared/storage/` — helpers de storage (ex: URL de assets públicos)

> **Regra:** se é usado por mais de um módulo e não é wrapper de terceiro, vai em `src/shared/`.
> Constantes ou validações específicas de **um só módulo** ficam em `src/modules/<module>/shared/`.
> Componentes de UI reutilizáveis de **um só módulo** ficam em `src/modules/<module>/shared/ui/`.

### `src/shared/components/` — UI composta global
Usar para componentes compostos de aplicação reutilizados entre múltiplas rotas ou módulos.

- Exemplo: `header`, `footer`, `hero`, `admin-tabs`
- Não usar essa pasta para primitives/base UI; esses arquivos ficam em `src/shared/ui/`
- Não colocar lógica server nessa pasta; manter apenas composição visual e comportamento client/server de apresentação

### `src/modules/<module>/shared/ui/` — UI compartilhada por módulo
Usar para componentes visuais reutilizáveis que pertencem a um único módulo.

- Exemplo: cards, form sections, dialogs e componentes auxiliares usados só dentro de `auth`
- Não usar `src/shared/ui/` para UI que ainda é específica de um módulo
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

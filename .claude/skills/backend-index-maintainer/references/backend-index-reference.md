# Backend Index Reference

Este arquivo contém templates e padrões para gerar `BACKEND_INDEX.md` raiz e local.

Use este arquivo como referência prática ao aplicar a skill `Backend Index Maintainer`.

---

## Convenção de arquivos

### Índice raiz

```txt
BACKEND_INDEX.md
```

### Índice local

```txt
src/modules/**/server/BACKEND_INDEX.md
```

### Índice legado aceito temporariamente

```txt
src/modules/**/server/README.md
```

---

## Estrutura comum

Tanto o índice raiz quanto o índice local devem seguir a mesma lógica:

```txt
1. Título
2. Visão geral
3. Mapa navegável
4. Dependências
5. Fluxos ou relações principais
6. Pontos de atenção
7. Notas de manutenção
```

A diferença está no nível de detalhe:

* raiz: mapeia módulos;
* local: mapeia arquivos e fluxos internos.

---

# Template: índice raiz

Use este template para:

```txt
BACKEND_INDEX.md
```

````md
# Backend Index

Mapa da camada backend do repositório.

Este arquivo aponta para os índices backend locais e ajuda a localizar rapidamente módulos/submódulos com código server-side.

---

## Visão geral

Este repositório possui backend modular em:

```txt
src/modules/**/server
````

Use este arquivo como ponto de partida para localizar o índice local do módulo que será lido ou alterado.

---

## Módulos com backend

| Módulo/Submódulo       | Server path                               | Índice                                                     | Status | Observações          |
| ---------------------- | ----------------------------------------- | ---------------------------------------------------------- | ------ | -------------------- |
| `<module>`             | `src/modules/<module>/server`             | `src/modules/<module>/server/BACKEND_INDEX.md`             | `ok`   | `<observação curta>` |
| `<module>/<submodule>` | `src/modules/<module>/<submodule>/server` | `src/modules/<module>/<submodule>/server/BACKEND_INDEX.md` | `ok`   | `<observação curta>` |

---

## Dependências entre módulos

Registre apenas dependências backend relevantes.

```txt
<module-a>
  -> <module-b>
  -> <module-c>

<module-d>/<submodule>
  -> <module-a>
```

---

## Índices ausentes, legados ou atenção

| Path                                    | Situação   | Ação recomendada               |
| --------------------------------------- | ---------- | ------------------------------ |
| `src/modules/<module>/server/README.md` | legado     | migrar para `BACKEND_INDEX.md` |
| `src/modules/<module>/server`           | sem índice | criar índice local             |

Se não houver pendências:

```md
Nenhum item identificado.
```

---

## Notas de manutenção

Atualize este arquivo quando:

* um novo diretório `src/modules/**/server` for criado;
* um diretório `src/modules/**/server` for removido;
* um índice local for criado;
* um índice local for removido;
* um índice local for migrado de `README.md` para `BACKEND_INDEX.md`;
* uma dependência backend importante entre módulos mudar.

````

---

# Template: índice local

Use este template para:

```txt
src/modules/**/server/BACKEND_INDEX.md
````

````md
# <module-path>/server

Índice da camada server-side de `<module-path>`.

Este arquivo serve como mapa rápido para entender os entrypoints, arquivos principais, dependências e fluxos backend deste módulo/submódulo.

---

## Visão geral

Descreva em poucas linhas o papel deste backend.

Exemplo:

```txt
Este módulo concentra autenticação, sessão e operações relacionadas ao usuário autenticado.
````

---

## Entrypoints

| Entrypoint       | Arquivo                   | Observações          |
| ---------------- | ------------------------- | -------------------- |
| `<functionName>` | `./relative/path/file.ts` | `<observação curta>` |

Se não houver entrypoint direto:

```md
Nenhum entrypoint direto identificado.
```

---

## Slices

| Slice          | Caminho                  | Responsabilidade           |
| -------------- | ------------------------ | -------------------------- |
| `<slice-name>` | `./slices/<slice-name>/` | `<responsabilidade curta>` |

Se não houver slices:

```md
Nenhum slice local.
```

---

## Actions

| Action         | Caminho                                     | Observações          |
| -------------- | ------------------------------------------- | -------------------- |
| `<actionName>` | `./slices/<slice>/actions/<file>.action.ts` | `<observação curta>` |

Se não houver actions:

```md
Nenhuma action local.
```

---

## Use-cases

| Use-case        | Caminho                                         | Observações          |
| --------------- | ----------------------------------------------- | -------------------- |
| `<useCaseName>` | `./slices/<slice>/use-cases/<file>.use-case.ts` | `<observação curta>` |

Se não houver use-cases:

```md
Nenhum use-case local.
```

---

## Steps

Use esta seção apenas se o módulo possuir steps.

| Step         | Caminho                                 | Responsabilidade           |
| ------------ | --------------------------------------- | -------------------------- |
| `<stepName>` | `./slices/<slice>/steps/<file>.step.ts` | `<responsabilidade curta>` |

Se não houver steps, omita esta seção.

---

## Services locais

| Service         | Caminho                        | Responsabilidade           |
| --------------- | ------------------------------ | -------------------------- |
| `<serviceName>` | `./services/<file>.service.ts` | `<responsabilidade curta>` |

Se não houver services locais:

```md
Nenhum service local.
```

---

## Repos locais

| Repo              | Caminho                        | Responsabilidade           |
| ----------------- | ------------------------------ | -------------------------- |
| `<repoName>`      | `./repos/<file>.repo.ts`       | `<responsabilidade curta>` |
| `<adminRepoName>` | `./repos/<file>.admin.repo.ts` | `<responsabilidade curta>` |

Se não houver repos locais:

```md
Nenhum repo local.
```

---

## Dependências externas ao módulo

Liste apenas dependências backend relevantes.

### `<module-name>`

| Import                          | Uso     |
| ------------------------------- | ------- |
| `@/modules/<module>/server/...` | `<uso>` |

### `shared`

| Import         | Uso     |
| -------------- | ------- |
| `@/shared/...` | `<uso>` |

### `lib`

| Import      | Uso     |
| ----------- | ------- |
| `@/lib/...` | `<uso>` |

Se não houver dependências externas relevantes:

```md
Nenhuma dependência externa relevante identificada.
```

---

## Call Matrix

| Origem        | Chama         | Observações          |
| ------------- | ------------- | -------------------- |
| `<functionA>` | `<functionB>` | `<observação curta>` |
| `<functionB>` | `<functionC>` | `<observação curta>` |

A Call Matrix deve ser baseada em imports e chamadas reais.

---

## Fluxos

### Fluxo: `<nome do fluxo>`

1. `<primeiro passo>`
2. `<segundo passo>`
3. `<terceiro passo>`
4. Retorna `<resultado esperado>`

Use nomes de função quando isso ajudar na navegação.

---

## Comportamentos importantes

Registre somente comportamentos importantes para manutenção.

Exemplos:

### Rollback

Explique quando o rollback acontece e qual função executa a compensação.

### Best-effort

Explique quais falhas não bloqueiam o fluxo principal.

### Sessão

Explique quando o fluxo depende de sessão, autenticação ou limpeza de sessão.

### Infra/Admin

Explique quando o fluxo depende de client admin, SDK externo, e-mail, storage ou outra infraestrutura sensível.

Se não houver comportamento especial:

```md
Nenhum comportamento especial identificado.
```

---

## Não usados / Atenção

| Item                 | Motivo     | Recomendação         |
| -------------------- | ---------- | -------------------- |
| `<arquivo ou fluxo>` | `<motivo>` | `<ação recomendada>` |

Se não houver pontos de atenção:

```md
Nenhum item identificado.
```

---

## Notas de manutenção

Atualize este arquivo quando:

* criar, remover ou mover arquivos dentro deste `server`;
* alterar entrypoints;
* alterar fluxos principais;
* alterar dependências externas;
* alterar rollback, fallback ou best-effort;
* adicionar ou remover services/repos locais;
* mover responsabilidade para outro módulo.

````

---

# Status recomendados para índice raiz

Use estes status na tabela do índice raiz:

| Status | Significado |
|---|---|
| `ok` | índice local existe e parece coerente |
| `missing` | diretório `server` existe, mas não há índice local |
| `legacy` | existe `server/README.md`, mas ainda não existe `server/BACKEND_INDEX.md` |
| `stale?` | índice existe, mas pode estar desatualizado |
| `review` | precisa de revisão manual |

---

# Diretrizes de escrita

## Bom

```md
| `registerAndJoinUseCase` | `resolveInviterByRefStep` | Best-effort; não bloqueia cadastro |
````

```md
Falhas no envio de e-mail são logadas, mas não impedem o cadastro.
```

```md
Este módulo não possui repos locais; persistência é delegada aos módulos responsáveis.
```

---

## Ruim

```md
Actions devem chamar services e services devem chamar repos.
```

Motivo: regra global, pertence ao `AGENTS.md`.

---

```md
No futuro devemos refatorar isso para uma arquitetura melhor.
```

Motivo: plano futuro, não é mapa do backend atual.

---

```md
Esta feature deve aumentar a conversão de usuários.
```

Motivo: objetivo de produto, pertence ao PRD.

---

```md
Rodar npm run typecheck antes de finalizar.
```

Motivo: comando global, pertence ao `AGENTS.md`.

---

# Exemplo curto: índice raiz

````md
# Backend Index

Mapa da camada backend do repositório.

---

## Visão geral

O backend está organizado em módulos dentro de `src/modules/**/server`.

---

## Módulos com backend

| Módulo/Submódulo | Server path | Índice | Status | Observações |
|---|---|---|---|---|
| `auth` | `src/modules/auth/server` | `src/modules/auth/server/BACKEND_INDEX.md` | `ok` | Auth, sessão e usuário autenticado |
| `accounts/onboarding` | `src/modules/accounts/onboarding/server` | `src/modules/accounts/onboarding/server/BACKEND_INDEX.md` | `ok` | Cadastro inicial e entrada em organização |
| `organizations/referrals` | `src/modules/organizations/referrals/server` | `src/modules/organizations/referrals/server/BACKEND_INDEX.md` | `ok` | Referrals e convites |

---

## Dependências entre módulos

```txt
accounts/onboarding
  -> auth
  -> accounts/users
  -> accounts/users/profiles
  -> organizations
  -> organizations/memberships
  -> organizations/referrals
  -> emails
````

---

## Índices ausentes, legados ou atenção

Nenhum item identificado.

````

---

# Exemplo curto: índice local

```md
# accounts/onboarding/server

Índice da camada server-side de `accounts/onboarding`.

---

## Visão geral

Este submódulo concentra o fluxo de cadastro inicial, autenticação, entrada em organização e registro de referral.

---

## Entrypoints

| Entrypoint | Arquivo | Observações |
|---|---|---|
| `registerAndJoinAction` | `./slices/register-and-join/actions/register-and-join.action.ts` | Valida schema server e chama o use-case |
| `registerAndJoinUseCase` | `./slices/register-and-join/use-cases/register-and-join.use-case.ts` | Orquestra cadastro, membership, referral e e-mail |

---

## Slices

| Slice | Caminho | Responsabilidade |
|---|---|---|
| `register-and-join` | `./slices/register-and-join/` | Cadastro inicial e entrada na organização |

---

## Actions

| Action | Caminho | Observações |
|---|---|---|
| `registerAndJoinAction` | `./slices/register-and-join/actions/register-and-join.action.ts` | Recebe `unknown`, valida e normaliza entrada |

---

## Use-cases

| Use-case | Caminho | Observações |
|---|---|---|
| `registerAndJoinUseCase` | `./slices/register-and-join/use-cases/register-and-join.use-case.ts` | Fluxo principal do submódulo |

---

## Services locais

Nenhum service local.

---

## Repos locais

Nenhum repo local.

---

## Dependências externas ao módulo

| Import | Uso |
|---|---|
| `@/modules/auth/server/services/sign-up.service` | Criar usuário no Auth |
| `@/modules/auth/server/services/sign-in.service` | Autenticar usuário existente |
| `@/modules/accounts/users/server/services/create-user.service` | Criar `public.users` |
| `@/modules/organizations/memberships/server/services/create-membership.service` | Criar membership |
| `@/modules/organizations/referrals/server/services/create-referral.service` | Registrar referral |

---

## Fluxos

### Fluxo: Register and Join

1. `registerAndJoinAction` valida entrada.
2. `registerAndJoinUseCase` resolve a organização pelo host.
3. Resolve referral, se houver.
4. Cria usuário no Auth ou autentica usuário existente.
5. Cria dados públicos para usuário novo.
6. Garante membership.
7. Envia e-mail de boas-vindas de forma best-effort.
8. Registra referral de forma best-effort.
9. Retorna `organizationId` e `userId`.

---

## Comportamentos importantes

### Referral best-effort

Falhas ao resolver ou registrar referral não bloqueiam o cadastro.

### Rollback

Se o usuário foi criado no Auth e a criação dos dados públicos falhar, o fluxo tenta remover o usuário do Auth.

---

## Não usados / Atenção

Nenhum item identificado.
````

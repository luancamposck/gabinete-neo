# Backend layers

## Fluxo

- Fluxo padrão (casos simples): `Action -> Service -> Repo`
- Fluxo para casos complexos/orquestração: `Action -> Use-case -> Service(s) -> Repo(s)`

### Quando usar Use-case
Use apenas quando:
- precisa orquestrar múltiplos passos/fluxos
- existe branching (validações + side effects + auditoria)
- precisa coordenar consistência entre múltiplas operações

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

## Responsabilidade por camada

| Responsabilidade               |                Action | Use-case |  Service |                Repo |
| ------------------------------ | --------------------: | -------: | -------: | ------------------: |
| Validar input com Zod          |                   Sim |      Não |      Não |                 Não |
| Traduzir `code` para `message` |                   Sim |      Não |      Não |                 Não |
| Ter `MSG_*`                    |                   Sim |      Não |      Não |                 Não |
| Orquestrar múltiplos passos    |                   Não |      Sim |      Não |                 Não |
| Fazer rollback/compensação     |                   Não |      Sim | Às vezes |                 Não |
| Chamar Supabase                |                   Não |      Não |      Não |                 Sim |
| Chamar Repo                    |                   Não |      Não |      Sim |                 Não |
| Chamar Service                 | Sim, se fluxo simples |      Sim |      Não |                 Não |
| Fazer log técnico de infra     |                   Não |   Evitar |      Sim |              Evitar |
| Retornar `OperationResponse`   |                   Sim |      Não |      Não |                 Não |
| Retornar `AppResultAsync`      |                   Não |      Sim |      Sim | Não necessariamente |

### Action (Server Action)
- Valida input do usuário com **Zod** antes de chamar a próxima camada.
- Chama `Service` (fluxo simples) ou `Use-case` (fluxo complexo).
- É a borda pública mais comum entre UI e backend.
- Deve retornar tipo explícito `OperationResponse` (em `src/shared/types/operation-response.types.ts`).
- Deve traduzir `code` interno para `message` usando constantes `MSG_*`.
- Não deve acessar Repo diretamente.
- Não deve conter regra de negócio que pertence a Service ou Use-case.

### Use-case
- Usado apenas em fluxos complexos/orquestração.
- Consome um ou mais Services.
- Retorna `AppResultAsync`, sem `message`.
- Não deve conter mensagens de usuário (`MSG_*`).
- Não deve acessar Supabase diretamente.
- Não deve acessar Repo diretamente.
- Não deve fazer logs técnicos de infra por padrão; erros técnicos devem ser logados na Service responsável.
- Pode coordenar rollback, compensações, branching, autenticação, tenant, permissões e side effects.
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

### Service
- Centraliza regra de negócio e tradução de erros de Repo para `code`.
- Consome Repo(s).
- Retorna `AppResultAsync`, sem `message`.
- Não deve conter mensagens de usuário (`MSG_*`).
- Deve registrar logs técnicos quando houver erro de infra, erro inesperado ou erro retornado por Repo.
- Deve usar `prefixLog` no formato `"[nomeDaService]:"` quando houver logs técnicos.

### Repo
- Extremamente fino.
- Apenas executa operações no Supabase e retorna o resultado tipado.
- Sem regra de negócio, validação de input, mensagem de usuário, log de fluxo ou orquestração.

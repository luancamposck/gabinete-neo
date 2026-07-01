# Technical Plan Reference

Templates e exemplos práticos para cada seção do `04-technical-plan.md`.

Use este arquivo como referência ao aplicar a skill `technical-plan`. Ele não substitui o processo descrito no `SKILL.md` — só mostra o formato esperado de cada bloco.

---

## 1. Overview

Resumo curto (3-5 linhas) do que a feature faz e qual decisão técnica central este plano toma. Sem repetir o PRD inteiro.

---

## 2. Inputs Reviewed

```md
| File | Status | Notes |
|---|---|---|
| `01-brief.md` | `ok` | Lido, sem conflito |
| `02-context-scan.md` | `ok` | Módulo dono já identificado |
| `03-prd.md` | `ok` | User stories US-001 a US-004 usadas como base |
```

Se algum arquivo não existir, marque como `missing` e explique o impacto (ex.: "Context Scan ausente; module ownership inferido apenas pelo PRD e código").

---

## 3. Technical Assumptions

Resuma as decisões técnicas inferidas do PRD/Context Scan antes de detalhar o plano. Servem para o usuário confirmar ou corrigir rapidamente — não são perguntas abertas.

```md
Com base no PRD e Context Scan, este plano assume:

- O módulo dono será `accounts/onboarding`.
- O fluxo deve reutilizar services de `auth` e `organizations/memberships`.
- Referral deve continuar best-effort.
- Falhas após criação no Auth devem preservar rollback.
- Não será criada nova arquitetura de módulos.

Corrija qualquer assumption incorreta.
```

Incerteza técnica crítica (não apenas confirmação de rotina) → registre em **14. Open Technical Questions**, não aqui.

---

## 4. Module Ownership

Classificações: `owner` (implementação principal), `dependency` (consumido pela feature), `reference` (exemplo de padrão), `unchanged` (relevante, sem alteração planejada).

```md
| Módulo/Submódulo | Papel | Motivo |
|---|---|---|
| `accounts/onboarding` | `owner` | Fluxo principal de cadastro e entrada em organização |
| `auth` | `dependency` | Criação/autenticação de usuário |
| `organizations/memberships` | `dependency` | Criação e validação de membership |
```

---

## 5. Proposed Architecture

Estratégia técnica em alto nível, sem implementar. Inclua: fluxo principal, responsabilidades por módulo, reaproveitamento de código existente, novas abstrações necessárias, contratos de entrada/saída, tratamento de erros, rollback/fallback/best-effort, validação, consistência de dados. Evite detalhe linha a linha (isso é Ralph Breakdown, não Technical Plan).

---

## 6. File Plan

Status possíveis: `create`, `update`, `read-only`, `maybe`, `remove`.

```md
| Ação | Arquivo | Motivo |
|---|---|---|
| `create` | `src/modules/.../server/slices/.../actions/example.action.ts` | Novo entrypoint server-side |
| `create` | `src/modules/.../server/slices/.../use-cases/example.use-case.ts` | Orquestra fluxo principal |
| `update` | `src/modules/.../server/BACKEND_INDEX.md` | Registrar novo fluxo |
| `read-only` | `src/modules/auth/server/services/sign-up.service.ts` | Reutilizar padrão existente |
```

Não escreva código — só o caminho, a ação e o motivo.

---

## 7. Data / Database Plan

Se a feature tocar banco, documente tabelas envolvidas, colunas novas, constraints, indexes, RLS, triggers, RPCs, migrations, tipos Supabase, e dados que precisam permanecer consistentes.

```md
### Tabelas afetadas

- `organization_memberships`
- `organization_invites`

### Migration necessária

Sim.

### Possíveis mudanças

- Criar tabela `organization_invites`
- Adicionar índice para `token`
- Garantir unicidade para convite ativo
```

Se não tocar banco:

```md
Esta feature não exige alteração de banco conhecida.
```

---

## 8. Contracts

Defina contratos esperados sem implementar tipos finais: input da action/use-case, output esperado, códigos de erro relevantes, formato de `OperationResponse` (se aplicável), impacto no client.

```md
### Input

- `inviteToken: string`
- `organizationId?: string`

### Output

- `OperationResponse<{ membershipId: string }>`

### Erros esperados

- `invalid_invite`
- `expired_invite`
- `already_member`
- `unauthenticated`
- `infra_error`
```

---

## 9. Validation & Security

Validação server-side, autenticação, autorização/roles/ownership, multi-tenant, prevenção de vazamento de dado sensível, uso de admin client, limites de acesso por organização.

```md
- Validar input com schema server-side.
- Exigir usuário autenticado.
- Garantir que o convite pertence à organização correta.
- Não expor se um e-mail específico já existe.
```

---

## 10. Side Effects & Integrations

E-mail, webhook, storage, pagamento, analytics, logs, filas, APIs externas. Indique se cada um bloqueia o fluxo ou é best-effort.

```md
| Side effect | Bloqueia fluxo? | Observação |
|---|---|---|
| Enviar e-mail de boas-vindas | Não | Best-effort; falha deve ser logada |
| Criar membership | Sim | Parte central do fluxo |
```

---

## 11. Error Strategy

Erros esperados, erros inesperados, mensagens amigáveis, códigos, logs técnicos, rollback, fallback, operações best-effort.

```md
- Erros de validação retornam mensagem amigável.
- Erros técnicos retornam mensagem genérica.
- Falhas em referral não bloqueiam o fluxo.
- Falhas após criação no Auth exigem rollback.
```

---

## 12. Documentation Updates

Liste índices e docs que precisam ser atualizados após a implementação.

```md
- Atualizar `src/modules/accounts/onboarding/server/BACKEND_INDEX.md`
- Atualizar `BACKEND_INDEX.md` raiz se novo diretório `server` for criado
```

---

## 13. Risks & Trade-offs

```md
| Risco/Trade-off | Impacto | Mitigação |
|---|---|---|
| Reutilizar `sign-up.service` pode acoplar onboarding a mudanças futuras em `auth` | médio | Confirmar contrato estável antes de implementar |
```

---

## 14. Open Technical Questions

Liste apenas dúvidas técnicas reais que impedem ou arriscam a implementação — não repita perguntas já respondidas no PRD/Context Scan.

```md
- Devemos usar admin client para criar o convite, ou o RLS já cobre esse caso?
- O rollback deve remover também o membership, se já tiver sido criado?
```

Se não houver dúvidas, escreva: `Nenhuma dúvida técnica pendente.`

---

## 15. Next Step

Se não houver Open Technical Questions bloqueantes:

```md
Ralph Breakdown.
```

Se houver dúvida técnica crítica pendente, indique que ela deve ser resolvida antes do Ralph Breakdown:

```md
Resolver Open Technical Questions antes de seguir para Ralph Breakdown.
```

---

## Estrutura completa do arquivo final

```md
# Technical Plan: [Feature Name]

## 1. Overview

## 2. Inputs Reviewed
| File | Status | Notes |
|---|---|---|

## 3. Technical Assumptions
- ...

## 4. Module Ownership
| Módulo/Submódulo | Papel | Motivo |
|---|---|---|

## 5. Proposed Architecture

## 6. File Plan
| Ação | Arquivo | Motivo |
|---|---|---|

## 7. Data / Database Plan

## 8. Contracts

## 9. Validation & Security

## 10. Side Effects & Integrations

## 11. Error Strategy

## 12. Documentation Updates

## 13. Risks & Trade-offs
| Risco/Trade-off | Impacto | Mitigação |
|---|---|---|

## 14. Open Technical Questions
- ...

## 15. Next Step
Ralph Breakdown, se não houver Open Technical Questions bloqueantes.
```

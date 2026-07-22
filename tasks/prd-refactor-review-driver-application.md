# PRD: Padronização do fluxo de revisão de candidaturas de motorista

## Introdução

O fluxo de aprovar/rejeitar candidaturas de motorista (`review-driver-applications`) é o último fluxo do módulo `fleet` ainda no padrão legado. Enquanto `add-driver-application` e `get-pending-driver-applications` já foram migrados para o padrão flat com slice types e `AppResultAsync`, o fluxo de revisão continua dentro de `server/slices/`, com types declarados inline, `MSG_*` vazando para Service e Use-case, e um conjunto de pequenas divergências de convenção acumuladas.

Este PRD cobre a padronização completa desse fluxo: mover para o padrão flat, extrair os contratos para um slice types file, alinhar o contrato de retorno por camada e corrigir as divergências pontuais encontradas na comparação com os fluxos já refatorados.

Não há mudança de comportamento para o usuário final. É uma refatoração de consistência arquitetural.

---

## Decisões Inferidas

Baseado no prompt e na análise do código atual, assumo o seguinte. Corrija o que estiver errado:

- **Um único use-case.** Confirmado: `reviewDriverApplicationUseCase` continua sendo um use-case só, com discriminador `action: "approve" | "reject"`, e as duas Actions permanecem separadas (`approveDriverApplicationAction`, `rejectDriverApplicationAction`). O custo aceito é `Data.driverId` ser `string | null`.
- **Escopo de services.** Entram apenas os services do contexto de driver consumidos exclusivamente por este use-case: `approveDriverApplicationService` e `rejectDriverApplicationService`. Ficam **fora**: `getCurrentAuthUserService` (41 arquivos), `getOrganizationIdByAppDomainService` (41), `getRequestHost` (38) e `hasMembershipPermissionService` (19).
- **Repos entram no escopo.** Os três repos usados só por este fluxo (`approve`, `reject`, `getById`) têm types inline e entram junto, já que o slice types file é o destino natural desses contratos. Além disso, `getById` é hoje chamado direto pelo use-case, violando a regra de camadas — a correção entra como US-004.
- **Sem mudança de comportamento.** Mensagens de usuário, códigos de erro observáveis pela UI e o comportamento de `revalidatePath` permanecem equivalentes. O hook `useApplicationReview` não deve precisar de alteração de lógica.
- **RPC `register_driver_application` fica fora.** Os 3 erros de typecheck pendentes pertencem ao fluxo `register-as-driver`, não a este. Ver Open Questions.

---

## Goals

- Eliminar a pasta `server/slices/review-driver-applications/`, movendo use-case e actions para o padrão flat do módulo.
- Centralizar todos os contratos (Data/Codes) do fluxo em um único slice types file.
- Fazer Service e Use-case retornarem `AppResultAsync` sem `message`, com tradução `code → message` exclusivamente nas Actions.
- Alinhar convenções divergentes: código de erro genérico, constante de permissão, naming de types.
- Manter `BACKEND_INDEX.md` fiel à estrutura final.

---

## User Stories

### US-001: Criar o slice types file do fluxo de revisão
**Description:** Como desenvolvedor, quero os contratos do fluxo de revisão em um único arquivo de types para que Repo, Service, Use-case e Action compartilhem as mesmas definições, como nos fluxos já refatorados.

**Acceptance Criteria:**
- [x] Criar `src/modules/fleet/shared/types/slices/review-driver-application.types.ts`
- [x] Arquivo segue as seções em comentário do padrão existente: `// ============= REPO =============`, `// ============= SERVICE =============`, `// ============= USE-CASE =============`, `// ============= ACTION =============`
- [x] Exporta `ReviewDriverApplicationAction = "approve" | "reject"`
- [x] Exporta os contratos de Service: `ApproveDriverApplicationServiceData`, `ApproveDriverApplicationServiceCodes`, `RejectDriverApplicationServiceData`, `RejectDriverApplicationServiceCodes`
- [x] Exporta os contratos de Use-case: `ReviewDriverApplicationUseCaseData`, `ReviewDriverApplicationUseCaseCodes`
- [x] Exporta os contratos de Action: `ApproveDriverApplicationActionData`, `ApproveDriverApplicationActionCodes`, `RejectDriverApplicationActionData`, `RejectDriverApplicationActionCodes`
- [x] Params compartilhados de aprovação/rejeição (`{ applicationId, reviewerUserId }`) são centralizados no slice types file e expostos por aliases específicos de Repo e Service; `{ applicationId }` e `{ applicationId, action }` permanecem inline
- [x] Typecheck e lint passam

### US-002: Alinhar `rejectDriverApplicationService` e `approveDriverApplicationService` ao slice types
**Description:** Como desenvolvedor, quero que os dois services do contexto de driver consumam os types do slice e sigam o mesmo contrato, para que nenhum `MSG_*` sobreviva na camada de Service.

**Acceptance Criteria:**
- [x] `approve-driver-application.service.ts` retorna `AppResultAsync` (hoje retorna `OperationResponse`)
- [x] Nenhuma constante `MSG_*` permanece em nenhum dos dois services
- [x] Nenhum retorno dos dois services contém a propriedade `message`
- [x] Ambos importam Data/Codes do slice types file, sem declarar types locais
- [x] Código de erro genérico é `generic_error` nos dois (ver FR-5)
- [x] Comportamento preservado: `approve` continua distinguindo `not_found` / `already_reviewed`; `reject` continua distinguindo `already_reviewed`
- [x] Typecheck e lint passam

### US-003: Mover os types dos repos do fluxo para o slice types file
**Description:** Como desenvolvedor, quero os contratos dos três repos deste fluxo no slice types file, eliminando os types soltos declarados dentro dos arquivos de repo.

**Acceptance Criteria:**
- [x] O type de retorno da RPC de aprovação (hoje `ApproveDriverApplicationRpcResult`, declarado inline em `approve-driver-application.admin.repo.ts`) passa a viver no slice types file
- [x] O type `DriverApplicationRow`, hoje exportado de `get-driver-application-by-id.admin.repo.ts`, passa a viver no slice types file
- [x] O campo `status` desse contrato usa o enum gerado do Supabase (`driver_application_status`) em vez de `string`
- [x] Nenhum dos três repos (`approve`, `reject`, `getById`) declara `type Params` local
- [x] Typecheck e lint passam

### US-004: Criar Service de leitura da candidatura (corrigir violação de camadas)
**Description:** Como desenvolvedor, quero que o use-case pare de chamar um Repo diretamente, para que o fluxo respeite a regra de camadas do projeto.

**Contexto:** Hoje `reviewDriverApplicationUseCase` importa e chama `getDriverApplicationByIdAdminRepo` diretamente. Isso viola `docs/standards/backend-layers.md`, que na tabela de responsabilidades marca "Chamar Repo" como **Não** para Use-case, e na seção de Use-case afirma "Não deve acessar Repo diretamente". É a única ocorrência do módulo: nenhum use-case do padrão flat importa de `repos/`.

**Acceptance Criteria:**
- [x] Criar `src/modules/fleet/server/services/get-driver-application-by-id.service.ts`
- [x] O Service consome `getDriverApplicationByIdAdminRepo` e traduz erro de infra para `code`, sem `MSG_*` e sem `message`
- [x] Retorna `AppResultAsync<GetDriverApplicationByIdServiceData, GetDriverApplicationByIdServiceCodes>`, com Data/Codes no slice types file
- [x] Candidatura inexistente resolve para o code `not_found` (não para `success: true` com data nula)
- [x] O Service faz log técnico do erro de Repo, seguindo o padrão dos demais services do módulo
- [x] O use-case passa a chamar o Service e **não** importa mais nada de `repos/`
- [x] As decisões de negócio permanecem no use-case: comparação `organization_id !== organizationId` (não vazar existência cross-org) e checagem `status !== "pending"`
- [x] Remover `user_id` do `.select()` em `getDriverApplicationByIdAdminRepo` e do type `GetDriverApplicationByIdAdminRepoData` — confirmado que nenhum consumidor usa esse campo (só a query, o use-case e `BACKEND_INDEX.md` referenciam o repo, e nenhum lê `.user_id`)
- [x] `grep -rn "repos/" src/modules/fleet/server/use-cases/` não retorna nenhum resultado
- [x] Typecheck e lint passam

### US-005: Mover o use-case para o padrão flat e alinhar convenções
**Description:** Como desenvolvedor, quero o use-case fora de `slices/` e seguindo as mesmas convenções dos use-cases já migrados, para que o módulo tenha um padrão só.

**Acceptance Criteria:**
- [x] Arquivo movido para `src/modules/fleet/server/use-cases/review-driver-application.use-case.ts`
- [x] Retorna `AppResultAsync<ReviewDriverApplicationUseCaseData, ReviewDriverApplicationUseCaseCodes>`
- [x] Nenhuma constante `MSG_*` e nenhum retorno com `message`
- [x] Types importados do slice file; nenhum type declarado localmente
- [x] Guard de permissão usa `PERMISSIONS.FLEET_APPLICATIONS_MANAGE` em vez da string literal `"fleet.applications.manage"` (ver FR-6)
- [x] `try/catch` envolvendo o corpo inteiro é removido, alinhando com `addDriverApplicationUseCase` e `getPendingDriverApplicationsUseCase` (ver FR-7)
- [x] Consome apenas Services (nenhum import de `repos/`), conforme US-004
- [x] Comportamento preservado: a ordem dos guards (auth → org → permissão → load/escopo/status → aplicar revisão) permanece idêntica
- [x] Typecheck e lint passam

### US-006: Mover as duas Actions para o padrão flat com tradução de erro
**Description:** Como desenvolvedor, quero as Actions fora de `slices/`, sendo o único lugar do fluxo que conhece mensagens de usuário.

**Acceptance Criteria:**
- [x] Arquivos movidos para `src/modules/fleet/server/actions/approve-driver-application.action.ts` e `.../reject-driver-application.action.ts`
- [x] Cada Action declara seus próprios `MSG_*` e uma função `toMessage(code)`, no mesmo formato de `get-pending-driver-applications.action.ts`
- [x] `toMessage` cobre todos os códigos do union, com `default` para o genérico
- [x] Cada Action continua retornando `OperationResponse` e chamando `revalidatePath("/dashboard/config/fleet")` apenas no caminho de sucesso
- [x] Types de Action importados do slice types file
- [x] Mensagens de sucesso permanecem distintas por operação ("aprovada" / "rejeitada")
- [x] Typecheck e lint passam

### US-007: Atualizar consumidores e remover a pasta legada
**Description:** Como desenvolvedor, quero que nada mais aponte para `slices/review-driver-applications/` e que a pasta deixe de existir.

**Acceptance Criteria:**
- [x] `use-application-review.ts` importa as Actions dos novos caminhos flat
- [x] Nenhuma alteração na lógica do hook (estado, toasts, `onResolved`, bulk) é necessária
- [x] `grep -r "review-driver-applications" src/` não retorna nenhum resultado
- [x] A pasta `src/modules/fleet/server/slices/review-driver-applications/` é removida do disco
- [x] Typecheck e lint passam
- [ ] Aprovar e rejeitar (individual e em lote) verificados no browser usando a skill dev-browser

> Validação visual pendente: a skill `dev-browser` não estava disponível durante a implementação.

### US-008: Atualizar o BACKEND_INDEX.md do módulo
**Description:** Como desenvolvedor, quero o índice do backend refletindo a estrutura final, já que ele é usado como mapa de navegação do módulo.

**Acceptance Criteria:**
- [ ] As linhas de `approveDriverApplicationAction`, `rejectDriverApplicationAction` e `reviewDriverApplicationUseCase` apontam para os novos caminhos flat
- [ ] A menção a `review-driver-applications` como slice legado (seções de introdução e de observações finais) é removida ou atualizada
- [ ] A entrada do repo de leitura reflete o nome/caminho atual (`getDriverApplicationByIdAdminRepo`)
- [ ] Nenhuma linha do índice aponta para caminho inexistente

---

## Functional Requirements

- **FR-1:** Use-case e Actions do fluxo de revisão devem residir em `server/use-cases/` e `server/actions/`, sem nenhuma pasta `slices/` intermediária.
- **FR-2:** Todos os contratos Data/Codes de Repo, Service, Use-case e Action deste fluxo devem estar em `shared/types/slices/review-driver-application.types.ts`.
- **FR-3:** Types de contrato devem usar o sufixo `Data`/`Codes` por camada (ex.: `ReviewDriverApplicationUseCaseData`), substituindo os atuais `...Res` e `ErrorCodes`.
- **FR-4:** Params de plumbing não devem ser extraídos para o slice types file; permanecem inline na assinatura da função. Aplica-se a `{ applicationId }`, `{ applicationId, reviewerUserId }` e `{ applicationId, action }`.
- **FR-5:** O código de erro genérico deste fluxo deve ser `generic_error` em todas as camadas, substituindo `infra_error`, alinhando com `add-driver-application` e `get-pending-driver-applications`.
- **FR-6:** O guard de permissão deve referenciar `PERMISSIONS.FLEET_APPLICATIONS_MANAGE`; strings literais de permissão não são aceitas.
- **FR-7:** O use-case não deve envolver seu corpo inteiro em `try/catch`. O tratamento de exceção fica nos services, como nos use-cases já migrados.
- **FR-8:** Services e Use-case não devem declarar constantes `MSG_*` nem retornar `message`. Toda tradução `code → message` ocorre nas Actions.
- **FR-9:** Cada Action deve expor uma função `toMessage(code)` cobrindo todos os códigos do seu union, com `default` mapeando para a mensagem genérica.
- **FR-10:** Os contratos dos repos devem tipar `status` com o enum gerado do Supabase, não com `string`.
- **FR-11:** O use-case não deve importar nem chamar nenhum Repo. Todo acesso a dados passa por Service, conforme a tabela de responsabilidades de `docs/standards/backend-layers.md` ("Chamar Repo" = Não para Use-case).
- **FR-12:** A leitura da candidatura por id deve ser exposta por um Service dedicado, que traduz erro de Repo para `code` e resolve candidatura inexistente como `not_found`.
- **FR-13:** `BACKEND_INDEX.md` deve refletir os caminhos finais de todas as entradas do fluxo, incluindo o novo Service de leitura.
- **FR-14:** O comportamento externo deve permanecer equivalente: mesmos códigos de erro observáveis pela UI, mesmas mensagens de usuário e mesma revalidação de rota.

---

## Non-Goals (Out of Scope)

- **Não** refatorar services cross-module: `getCurrentAuthUserService`, `getOrganizationIdByAppDomainService`, `getRequestHost`, `hasMembershipPermissionService`.
- **Não** portar a RPC `register_driver_application` nem corrigir os 3 erros de typecheck do fluxo `register-as-driver`.
- **Não** migrar o slice `register-as-driver`, que permanece legado.
- **Não** alterar o schema do banco, a RPC `approve_driver_application` ou as policies de RLS.
- **Não** mudar UX: nenhum motivo obrigatório na rejeição, nenhum diálogo de confirmação novo, nenhuma alteração no hook `useApplicationReview` além dos caminhos de import.
- **Não** dividir `reviewDriverApplicationUseCase` em dois use-cases.
- **Não** alterar o TTL de signed URLs nem o modelo de assinatura de documentos da listagem.

---

## Technical Considerations

**Divergências identificadas na comparação com os fluxos já refatorados** (base para os FRs acima):

| # | Divergência | Referência do padrão correto |
|---|---|---|
| 1 | Use-case e Actions dentro de `slices/` | `server/use-cases/add-driver-application.use-case.ts` |
| 2 | Types declarados inline em 6 arquivos | `shared/types/slices/add-driver-application.types.ts` |
| 3 | Naming `...Res` / `ErrorCodes` | `...UseCaseData` / `...UseCaseCodes` |
| 4 | `infra_error` como código genérico | `generic_error` |
| 5 | `MSG_*` em Service e Use-case | `AGENTS.md` › Contratos de retorno |
| 6 | `approveDriverApplicationService` retorna `OperationResponse` | `createDriverApplicationService` |
| 7 | Permissão como string literal | `PERMISSIONS.FLEET_APPLICATIONS_MANAGE` |
| 8 | `try/catch` no corpo inteiro do use-case | `addDriverApplicationUseCase` |
| 9 | `status: string` no contrato do repo | enum `driver_application_status` |
| 10 | **Use-case chama Repo direto** (`getDriverApplicationByIdAdminRepo`) | `docs/standards/backend-layers.md` › Use-case não acessa Repo |
| 11 | `BACKEND_INDEX.md` desatualizado | — |

**Pontos de atenção:**

- **Guard duplo de status é intencional.** O use-case checa `status === "pending"` e o repo de reject reforça com `.eq("status","pending")` no update. Isso **não** é redundância a eliminar: é proteção contra corrida entre dois revisores. O mesmo vale para o `for update` dentro da RPC de aprovação.
- **`toMessage` duplicado entre as duas Actions é aceito.** As mensagens divergem por operação (aprovar vs rejeitar) e Actions são a borda pública; extrair um helper compartilhado acoplaria as duas sem ganho real.
- **`driverId` no Data do use-case.** Com use-case único, `driverId` é `string` no approve e `null` no reject. Manter `string | null` no contrato e deixar cada Action projetar o que precisa (a Action de reject já ignora o campo).
- **Ordem de implementação.** As stories têm dependência: US-001 (types) → US-002/US-003 (services e repos) → US-004 (service de leitura) → US-005 (use-case) → US-006 (actions) → US-007 (consumidores + remoção) → US-008 (índice). US-004 precisa vir antes de US-005, senão o use-case é movido carregando a violação de camadas. Fazer US-007 antes de US-006 quebra o build.
- **Verificação final.** `npm run fix:biome && npm run lint:biome && npm run typecheck`. Esperado ao final: apenas os 3 erros pré-existentes de `register_driver_application` permanecem.

---

## Success Metrics

- `grep -r "review-driver-applications" src/` retorna zero resultados.
- `grep -rn "MSG_" src/modules/fleet/server/services/ src/modules/fleet/server/use-cases/` retorna zero resultados para este fluxo.
- `grep -rn "infra_error" src/modules/fleet/` retorna zero resultados.
- `grep -rn "repos/" src/modules/fleet/server/use-cases/` retorna zero resultados (nenhum use-case chama Repo direto).
- Nenhum type de contrato deste fluxo declarado fora do slice types file.
- Contagem de erros de typecheck não aumenta em relação à baseline atual (3 erros, todos de `register_driver_application`).
- Aprovar e rejeitar continuam funcionando na tela `/dashboard/config/fleet`, individualmente e em lote.

---

## Open Questions

1. **RPC `register_driver_application` e slice `register-as-driver`.** A RPC continua ausente das migrations novas (existe só em `supabase/old-migrations/`), mantendo 3 erros de typecheck e o fluxo de auto-candidatura quebrado; o slice `register-as-driver` é o último legado do módulo depois desta refatoração. Reafirmado como fora de escopo — permanece em aberto, sem PRD ainda.

---

**Resolvidas nesta revisão** (mantidas aqui como registro; não são mais pontos em aberto):

- **Escopo de organização na query (US-004).** Mantém o comportamento atual: o Service busca só por `applicationId`, e o use-case compara `organization_id` depois, preservando a regra de negócio ("não vazar existência cross-org") explícita na camada de use-case em vez de escondida numa query de Service.
- **`user_id` em `getDriverApplicationByIdAdminRepo`.** Confirmado sem uso em nenhum consumidor — removido do escopo de US-004 (ver critério de aceite correspondente).
- **TTL de signed URLs.** A suposição original deste PRD estava desatualizada: o TTL não é mais 300s. `document-storage.ts` já usa `DOCUMENT_SIGNED_URL_TTL_SECONDS = 30 * 60` (30 min, ajustado justamente porque revisão de candidatura pode levar mais que os 5 min originais), e `signed-document-frame.tsx` já faz um `HEAD` check antes de embutir o documento e mostra uma mensagem amigável ("O link pode ter expirado. Atualize a página...") com botão de recarregar em vez de vazar o JSON de erro do Storage. Não há ação pendente; qualquer evolução futura (assinar sob demanda, por exemplo) é tema de um PRD à parte, não uma correção de bug.

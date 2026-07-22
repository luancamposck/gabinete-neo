# PRD: Refatorar registerAndJoinAsDriver no padrão de registerAndJoin

## Introdução / Overview

O fluxo público de auto-cadastro de motorista (`registerAndJoinAsDriverUseCase`, em
`src/modules/fleet/server/slices/register-as-driver/`) foi escrito **antes** da trigger
`public.handle_new_auth_user()` (migration `05_create_auth_user_sync_trigger.sql`) e antes das
convenções atuais de contrato de resultado. Hoje ele:

- cria o usuário **manualmente** (auth sem metadata + inserts em `public.users`/`public.user_profiles`),
  o que é **incompatível com a trigger** — a trigger levanta `missing_user_name_metadata` porque o
  signup não envia `user_metadata`, quebrando o cadastro de motorista novo;
- vive em pasta **legada** (`server/slices/<slice>/{actions,use-cases,steps}`);
- retorna `OperationResponse` com `MSG_*` **de dentro do use-case** (viola `AGENTS.md`);
- depende da RPC `register_driver_application`, que **só existe em `supabase/old-migrations/`** e não foi
  trazida para o set consolidado.

O fluxo mais novo `registerAndJoinUseCase` (`src/modules/onboarding/server/use-cases/register-and-join.use-case.ts`)
já representa o padrão correto: estrutura flat, criação de conta **atômica via trigger**, `AppResultAsync`
sem `MSG_*`, arquivo de slice-types dedicado e tradução `code → message` na Action.

Este PRD refatora **apenas o fluxo público de motorista (Flow A)** para espelhar o `registerAndJoin`,
com as services adicionais que a parte de motorista exige (documentos + candidatura). A criação de conta
passa a ser trigger-based, o **use-case** passa a chamar `signInService` logo após `createUserService` para
o usuário novo sair logado, a candidatura vira **insert puro em tabela única + constraints** (sem RPC), e o
código legado é migrado/removido.

## Goals

- Fazer `registerAndJoinAsDriverUseCase` criar a conta pelo mesmo caminho trigger-based do
  `registerAndJoinUseCase` (auth + `public.users` + `public.user_profiles` atômicos via
  `handle_new_auth_user()`), corrigindo o cadastro de motorista novo hoje quebrado.
- Remover qualquer `step` do use-case: apenas orquestração inline de services puras.
- Reutilizar o payload de motorista que o `addDriverApplicationUseCase` já usa (`uploadDriverDocumentService`
  singular 2x, `checkPlateAvailableService`, `checkPendingDriverApplicationService`,
  `createDriverApplicationService`, `deleteDriverDocumentsService`) — nada novo é criado no payload; **não**
  tocar em services muito reutilizadas (`getOrganizationIdByAppDomainService`,
  `isUserMemberOfOrganizationService`, `getOrganizationByIdService`, `sendWelcomeEmailService`,
  `getRoleByNameService`, `createOrganizationMembershipService`, `signInService`).
- Criar arquivo de slice-types dedicado para o fluxo.
- Use-case retorna só `AppResultAsync` (sem `MSG_*`); a Action passa a traduzir `code → message`.
- Registrar candidatura **reusando** `createDriverApplicationService` (insert puro em tabela única, existente),
  protegido por constraints do banco e pré-checks de placa/candidatura pendente, eliminando a dependência da
  RPC `register_driver_application`.
- Fazer o **use-case** chamar `signInService` após `createUserService` (nos dois fluxos), para que o usuário
  novo termine o cadastro autenticado — corrige também o `registerAndJoin`, onde hoje o usuário novo é
  enviado ao `/dashboard` sem sessão. `createUserService` **não** é alterado.
- Migrar o fluxo da pasta legada `slices/` para a estrutura flat e remover arquivos órfãos.

> **Nota:** Mudanças de schema/migrations são feitas **fora deste PRD** (edição direta da migration de
> criação + `npm run db:reset`). O índice de candidatura pendente única por usuário
> (`(organization_id, user_id) where status = 'pending'`) **já foi adicionado** à migration
> `27_create_driver_applications.sql`; as stories abaixo assumem que ele existe.

## User Stories

### [x] US-001: Reusar checkPendingDriverApplicationService (remover duplicata)
**Description:** As a developer, I want to reuse the existing `checkPendingDriverApplicationService` for the
pending-application gate, so we don't duplicate logic already shared by `addDriverApplicationUseCase`.

**Acceptance Criteria:**
- [x] O fluxo usa o service **já existente** `checkPendingDriverApplicationService`
      (`src/modules/fleet/server/services/check-pending-driver-application.service.ts`) — reusado por
      `addDriverApplicationUseCase` e `createDriverApplicationService`; retorna `success` quando **não** há
      candidatura pendente e falha com o code `pending_application_exists`.
- [x] Removidos os arquivos duplicados **não usados** criados neste branch:
      `src/modules/fleet/server/services/check-no-pending-driver-application.service.ts` e
      `src/modules/fleet/shared/types/slices/check-no-pending-driver-application.types.ts` (confirmar zero
      callers por grep).
- [x] O repo `select-pending-driver-application-id-by-organization-and-user.admin.repo.ts` (já existente,
      usado pelo service reusado) é mantido.
- [x] Typecheck e `npm run lint:biome` passam.

### [x] US-002: Reusar createDriverApplicationService (insert puro existente)
**Description:** As a developer, I want the driver flow to reuse the existing `createDriverApplicationService`
(+ `insertDriverApplicationAdminRepo`), which already persists the application with a plain single-table
insert, so we don't rebuild it and we drop the obsolete RPC-based service.

**Acceptance Criteria:**
- [x] O use-case usa o service **já existente** `createDriverApplicationService`
      (`src/modules/fleet/server/services/create-driver-application.service.ts`) — insert único em
      `driver_applications` via `insertDriverApplicationAdminRepo`, `AppResultAsync`, sem `MSG_*`, já reusado
      por `addDriverApplicationUseCase`.
- [x] Os codes de domínio `plate_taken`/`pending_application_exists` vêm do **gate** (US-001 +
      `checkPlateAvailableService`), **não** do insert; `createDriverApplicationService` retorna
      `generic_error` em qualquer erro de banco (inclusive uma corrida que passe do gate e viole o índice
      único parcial) — mesmo comportamento do addDriverApplication.
- [x] O service legado `registerDriverApplicationService` (RPC `register_driver_application`) e seu repo
      `register-driver-application.admin.repo.ts` deixam de ser usados; são removidos em US-009.
- [x] Nenhum código novo referencia `supabaseAdmin.rpc("register_driver_application", ...)`.

### [x] US-003: Reusar uploadDriverDocumentService (singular) para os uploads
**Description:** As a developer, I want the driver flow to reuse the existing single-file upload service
(`uploadDriverDocumentService`), called once per document, so we drop the redundant plural service and share
the exact pattern already used by `addDriverApplicationUseCase`.

**Acceptance Criteria:**
- [x] O use-case usa `uploadDriverDocumentService`
      (`src/modules/fleet/server/services/upload-driver-document.service.ts`) **duas vezes** (CRLV e depois
      CNH), espelhando `addDriverApplicationUseCase` (`add-driver-application.use-case.ts:133-151`).
- [x] Em falha do 2º upload (CNH), o use-case desfaz o CRLV já enviado via `deleteDriverDocumentsService`.
- [x] A validação de MIME/tamanho continua sendo do Zod na Action (`registerAsDriverSchemaServer` já usa
      `driverDocumentFileSchema` em `crlv`/`cnh`); o service singular **não** valida arquivo.
- [x] Nenhum `MSG_*` novo introduzido; o service singular já retorna `AppResultAsync`.
- [x] O service plural `uploadDriverDocumentsService` fica órfão e é removido em US-009.
- [x] **Depende de US-006:** o uso 2x do service singular acontece dentro do use-case reescrito; o
      typecheck/lint completos são validados junto de US-006/US-010, não isoladamente.

### [x] US-004: Estabelecer sessão no use-case após criar a conta
**Description:** As a new user finishing signup, I want to be authenticated right after my account is
created, so that any post-signup redirect (dashboard/join) works instead of bouncing to login.

**Acceptance Criteria:**
- [x] O **use-case** (não o service) estabelece a sessão do usuário novo chamando `signInService` logo após
      `createUserService`, no branch de conta nova. `createUserService`
      (`src/modules/auth/server/services/create-user.service.ts`) **não** é alterado — não estabelece sessão
      nem chama repo de login.
- [x] Aplicado nos dois use-cases: `registerAndJoinAsDriverUseCase` e `registerAndJoinUseCase` (onboarding),
      este último passando a deixar o usuário novo autenticado (o push para `/dashboard` no form deixa de
      quicar para login).
- [x] Falha do `signInService` após a criação retorna um `code` estável (ex.: `invalid_signup`/`generic_error`).
- [x] Consistência com a política "nunca deslogar" (ver Resolvidas): remover as 3 chamadas de `signOutService`
      nas branches de falha de membership de `registerAndJoinUseCase` (e não adicioná-las no driver).
- [x] Typecheck e lint passam.

### [x] US-005: Arquivo de slice-types do fluxo de motorista
**Description:** As a developer, I want a dedicated slice-types file for the driver register-and-join flow,
so input/output DTOs and error codes follow the same convention as the onboarding flow.

**Acceptance Criteria:**
- [x] Novo arquivo `src/modules/fleet/shared/types/slices/register-and-join-as-driver.types.ts` com seções
      `USE-CASE` e `ACTION` (espelhando `register-and-join.types.ts`).
- [x] `RegisterAndJoinAsDriverUseCaseParams`, `RegisterAndJoinAsDriverUseCaseData`
      (`{ organizationId, userId, applicationId }`) e `RegisterAndJoinAsDriverUseCaseCodes` definidos.
- [x] Codes do use-case cobrem: `generic_error`, `org_not_found`, `username_taken`, `phone_taken`,
      `email_exists`, `weak_password`, `rate_limit`, `signup_disabled`, `invalid_signup`, `role_not_found`,
      `role_inactive`, `invalid_file`, `plate_taken`, `pending_application_exists`.
- [x] `RegisterAndJoinAsDriverActionCodes = RegisterAndJoinAsDriverUseCaseCodes | "invalid_input"`.
- [x] O input DTO deixa de morar em `src/modules/fleet/shared/types/inputs.ts` (removido de lá se ficar sem
      uso). Typecheck passa.

### [x] US-006: Reescrever o use-case (inline, AppResultAsync, sem MSG, Opção A)
**Description:** As a developer, I want `registerAndJoinAsDriverUseCase` rewritten to mirror
`registerAndJoinUseCase` plus the driver payload, with no step functions and no presentation concerns.

**Acceptance Criteria:**
- [x] Referência de implementação: `registerAndJoinUseCase` (ver Design Considerations) para a espinha
      (conta + membership + welcome + referral), e `addDriverApplicationUseCase` para o payload de motorista.
- [x] Novo arquivo em local flat: `src/modules/fleet/server/use-cases/register-and-join-as-driver.use-case.ts`.
- [x] Sem nenhuma função `*Step`; toda a orquestração é inline com blocos numerados (padrão `AGENTS.md`).
- [x] Ordem do fluxo:
      1. `getRequestHost` + `getOrganizationIdByAppDomainService` → `organizationId` (host ausente/org
         inexistente → `org_not_found`).
      2. Resolver inviter por `ref` (best-effort inline: `getUserIdByUsernameService` +
         `isUserMemberOfOrganizationService`; nunca bloqueia).
      3. `lookupUserIdByEmailService` → branch novo vs existente.
      4a. Existente: `signInService`.
      4b. Novo: `checkUsernameAvailableService` + `checkPhoneAvailableService` + `createUserService`
          (trigger-based) + `signInService` (estabelece a sessão — US-004).
      5. Membership: `isUserMemberOfOrganizationService` → `getRoleByNameService("MEMBER")` →
         `createOrganizationMembershipService` (idempotente: pula se já é membro; `joinedNow` calculado).
      6. Gate driver: `checkPlateAvailableService` + `checkPendingDriverApplicationService`
         (**antes** de qualquer upload).
      7. Upload: `uploadDriverDocumentService` (singular) 2x — CRLV e CNH; se a CNH falhar, desfaz o CRLV.
      8. `createDriverApplicationService` (insert puro existente). Em falha aqui: `deleteDriverDocumentsService`
         para limpar os documentos recém-enviados.
      9. Boas-vindas (best-effort, só se `joinedNow`): `getOrganizationByIdService` + `sendWelcomeEmailService`.
      10. Referral (best-effort inline): `createOrganizationReferralService` (só com inviter válido,
          `joinedNow`, e sem auto-referral).
- [x] Retorna `AppResultAsync<RegisterAndJoinAsDriverUseCaseData, RegisterAndJoinAsDriverUseCaseCodes>`.
- [x] **Nenhum** `MSG_*` nem `message` no use-case.
- [x] **Nenhum** rollback manual de auth user (a criação é atômica via trigger). O único cleanup manual é
      de documentos no storage, quando o insert da candidatura falha.
- [x] Em falha de membership, o usuário **não** é deslogado (política "nunca deslogar" — ver Resolvidas); o
      dashboard-guard redireciona quem ficou sem membership.
- [x] Typecheck e lint passam.

### [x] US-007: Refatorar os schemas do fluxo (padrão addDriverApplication)
**Description:** As a developer, I want the driver register schema aligned with the `add-driver-application`
schema conventions, so it lives in the right folder and reuses shared field schemas instead of duplicating
them.

**Acceptance Criteria:**
- [x] `register-as-driver.schema.ts` movido para
      `src/modules/fleet/shared/validations/slices/register-as-driver.schema.ts` (convenção `slices/`, como
      `add-driver-application.schema.ts`).
- [x] Removidas as definições locais duplicadas de `vehicleModelSchema`/`vehicleColorSchema`/`vehicleYearSchema`
      e do helper `emptyStringToUndefined`; passam a ser importadas de `vehicle.schema.ts` (idênticas às
      atuais), como faz `add-driver-application.schema.ts`.
- [x] Mantida a extensão de `registerAndJoinSchemaClient`/`registerAndJoinSchemaServer` + campos de
      veículo/documento (o fluxo público precisa dos campos de conta/endereço).
- [x] Todos os imports de `register-as-driver.schema` atualizados para o novo caminho (action + form).
- [x] Typecheck e lint passam.

### [x] US-008: Reescrever a Action baseada em addDriverApplicationAction
**Description:** As a developer, I want the driver action to follow the `addDriverApplicationAction` pattern
(plain `unknown` payload + direct Zod parse + `code → message`), at the flat path, so it stays
presentation-only.

**Acceptance Criteria:**
- [x] Novo arquivo `src/modules/fleet/server/actions/register-and-join-as-driver.action.ts`.
- [x] Assinatura `(formData: unknown)` e `registerAsDriverSchemaServer.safeParse(formData)` direto — **sem**
      helper `getString`/`FormData` (espelha `addDriverApplicationAction`); em falha de parse retorna
      `invalid_input`.
- [x] `toMessage(code)` cobrindo todos os codes de `RegisterAndJoinAsDriverActionCodes` com `MSG_*` locais
      (mesmo formato de `add-driver-application.action.ts`).
- [x] Retorna `OperationResponse<RegisterAndJoinAsDriverActionData, RegisterAndJoinAsDriverActionCodes>`
      (com `message`).
- [x] O form (`register-as-driver-form.tsx`) passa a chamar a action com um **objeto plano** (com os `File`
      de `crlv`/`cnh`), como `register-and-join-form.tsx`/o form de addDriverApplication fazem — não mais
      `FormData`. Aponta para o novo caminho da action.
- [x] Typecheck e lint passam.
- [ ] **[UI]** Verificar no browser que o formulário público de motorista envia e recebe o retorno traduzido
      corretamente (usar skill de browser).

> Verificação no browser omitida por solicitação do usuário.

### [x] US-009: Limpeza de legado
**Description:** As a developer, I want the old slice/steps files and now-orphaned services removed, so the
codebase has a single, current implementation.

**Acceptance Criteria:**
- [x] Removidos os arquivos antigos do fluxo em
      `src/modules/fleet/server/slices/register-as-driver/**` (action, use-case, steps locais).
- [x] Removida a pasta de steps compartilhada
      `src/modules/accounts/onboarding/server/slices/register-and-join/steps/**` **após** confirmar (grep)
      que nenhum outro código a importa.
- [x] Removidos `createUserService` (`src/modules/accounts/users/server/services/create-user.service.ts`) e
      `createUserProfileService` (`.../profiles/server/services/create-user-profile.service.ts`) **se** grep
      confirmar zero callers restantes; caso ainda haja caller, registrar em Open Questions em vez de remover.
- [x] Removido o service plural órfão `src/modules/fleet/server/services/upload-driver-documents.service.ts`
      (substituído pelo singular `uploadDriverDocumentService`), confirmando zero callers por grep.
- [x] Removido o service legado `src/modules/fleet/server/services/register-driver-application.service.ts` e
      seu repo `src/modules/fleet/server/repos/register-driver-application.admin.repo.ts` (RPC obsoleta,
      substituídos por `createDriverApplicationService`), confirmando zero callers por grep.
- [x] Grep confirma que não sobra import quebrado nem referência a `registerAndJoinAsDriver` no caminho antigo.
- [x] `npm run fix:biome && npm run lint:biome && npm run typecheck` passam limpos.

### US-010: Validação ponta a ponta
**Description:** As a developer, I want to verify the whole refactored flow end to end, so we know the new
driver signup works and the old bug is gone.

**Acceptance Criteria:**
- [ ] `npm run db:reset` + `npm run db:gen-types` sem erros.
- [ ] Cadastro de **motorista novo** (email inédito) cria auth+users+profile via trigger, cria membership,
      sobe documentos, cria candidatura `pending` e deixa o usuário autenticado.
- [ ] Cadastro com **email existente** (senha correta) faz login, cria membership se faltava e cria a
      candidatura, sem duplicar conta.
- [ ] Re-submit de quem **já tem candidatura pendente** falha no gate (`pending_application_exists`) **sem**
      subir documentos novos.
- [ ] Placa já usada por candidatura ativa retorna `plate_taken`.
- [ ] `npm run fix:biome && npm run lint:biome && npm run typecheck` passam.
- [ ] **[UI]** Verificar os cenários acima no browser (usar skill de browser).

## Functional Requirements

- FR-1: A criação de conta do fluxo de motorista deve usar `createUserService` (auth, trigger-based) com
  `user_metadata` completo; **não** deve mais inserir manualmente em `public.users`/`public.user_profiles`
  nem fazer rollback manual de auth user.
- FR-2: A sessão do usuário novo deve ser estabelecida **no use-case**, chamando `signInService` após
  `createUserService`; `createUserService` **não** é alterado. Vale para o driver e para o
  `registerAndJoinUseCase`.
- FR-3: O use-case não deve conter nenhuma função `*Step`; toda orquestração é inline chamando services.
- FR-4: O use-case deve retornar `AppResultAsync` sem `MSG_*`/`message`.
- FR-5: A candidatura deve ser criada **reusando** `createDriverApplicationService` (insert puro em tabela
  única, já existente), sem RPC.
- FR-6: A unicidade de placa ativa e de candidatura pendente por usuário **já é garantida pelo banco**
  (índices na migration `27_create_driver_applications.sql`, criados fora deste PRD); o use-case pré-checa
  ambas via código (`checkPlateAvailableService`, `checkPendingDriverApplicationService`) **antes** do
  upload de documentos, para falhar rápido com `code` amigável.
- FR-7: Em falha do insert da candidatura, os documentos recém-enviados devem ser removidos do storage; a
  conta e a membership **não** são desfeitas.
- FR-8: A Action deve receber `(formData: unknown)`, validar com `safeParse` direto (padrão
  `addDriverApplicationAction`, sem helper de `FormData`), retornar `invalid_input` em falha, e traduzir
  todos os `code` do use-case para `message` via `toMessage`.
- FR-9: Fluxo, action e slice-types devem viver na estrutura flat (`server/{actions,use-cases}`,
  `shared/types/slices/`), fora de `slices/`.
- FR-10: Arquivos legados do fluxo antigo e services que ficarem sem caller devem ser removidos.
- FR-11: As services muito reutilizadas listadas em Goals **não** devem ser alteradas neste PRD.
- FR-12: Em falha de criação de membership, o usuário **nunca** é deslogado (nem `new`, nem `existing`); o
  dashboard-guard redireciona. As chamadas atuais de `signOutService` no `registerAndJoinUseCase` são
  removidas.
- FR-13: O upload dos documentos deve reutilizar o service singular `uploadDriverDocumentService` (uma
  chamada por arquivo, no use-case), não a variante plural.
- FR-14: O schema `register-as-driver` deve morar em `validations/slices/` e reaproveitar os schemas
  compartilhados de `vehicle.schema.ts` (sem redefinições locais), espelhando `add-driver-application.schema.ts`.

## Non-Goals (Out of Scope)

- **Não** incluir mudanças de schema/migrations neste PRD. Elas são feitas fora dele (edição direta da
  migration de criação + `npm run db:reset`); o índice de candidatura pendente já foi adicionado à
  migration 27.
- **Não** criar a página/use-case self-service no dashboard (Flow B — membro autenticado adicionando a si
  mesmo como motorista) nem o redirect-on-failure para ela. Fica para PRD futuro.
- **Não** reconciliar/dedupe com `addDriverApplicationUseCase` (Flow C — staff adiciona outra pessoa).
- **Não** migrar para `AppResultAsync` as services de membership/role/referral compartilhadas
  (`createOrganizationMembershipService`, `getRoleByNameService`, `isUserMemberOfOrganizationService`,
  `createOrganizationReferralService`) — permanecem como estão, consumidas como hoje.
- **Não** alterar o schema de storage/path dos documentos (UUID aleatório + `upsert: false` permanece).
- **Não** mudar o lifecycle de candidatura (pending/approved/rejected) nem o fluxo de aprovação.
- **Não** redesenhar a UI do formulário público de motorista. Apenas: re-apontar a action, ajustar a chamada
  para passar um objeto plano (em vez de `FormData`) e atualizar o import do schema.

## Design Considerations — implementações de referência ("inspiração")

Cada peça deste fluxo tem um análogo já existente no código que serve de referência direta. Ao implementar,
espelhar a estrutura correspondente:

- **Use-case** → `registerAndJoinUseCase`
  (`src/modules/onboarding/server/use-cases/register-and-join.use-case.ts`): ordem dos passos, contrato
  `AppResultAsync`, orquestração inline sem steps, criação trigger-based. Base principal da US-006.
- **Payload de motorista (gate + upload 2x + candidatura)** → `addDriverApplicationUseCase`
  (`src/modules/fleet/server/use-cases/add-driver-application.use-case.ts`): **reusar o mesmo conjunto de
  services que ele já usa** — `checkPlateAvailableService`, `checkPendingDriverApplicationService`,
  `uploadDriverDocumentService` (singular, 2x com cleanup do CRLV), `createDriverApplicationService` e
  `deleteDriverDocumentsService`. Nada novo é criado no payload.
- **Action** → `addDriverApplicationAction`
  (`src/modules/fleet/server/actions/add-driver-application.action.ts`): assinatura `(formData: unknown)`,
  `schema.safeParse(formData)` direto (sem helper de `FormData`), e `toMessage(code)` de tradução. Base da US-008.
- **Schema** → `add-driver-application.schema.ts`
  (`src/modules/fleet/shared/validations/slices/add-driver-application.schema.ts`): mora em
  `validations/slices/` e reaproveita os schemas compartilhados de `vehicle.schema.ts` em vez de redefinir. Base da US-007.

## Technical Considerations

- A trigger `public.handle_new_auth_user()` já cria `public.users` + `public.user_profiles` a partir de
  `user_metadata`; por isso os pré-checks de `username`/`phone` são obrigatórios antes do
  `admin.createUser` (a Auth Admin API devolve erro opaco se a trigger levantar exceção de unicidade).
- `driver_applications` (migration `27_create_driver_applications.sql`) já possui o índice único parcial de
  placa ativa, o CHECK de formato de placa e o índice único parcial de candidatura pendente por usuário
  (`(organization_id, user_id) where status = 'pending'`, adicionado direto na migration, fora deste PRD).
- `checkPlateAvailableService` já existe e retorna `plate_taken`; reutilizar como pré-check.
- Regra de camadas (`AGENTS.md`): Service **não** chama outro Service nem orquestra "criar + logar" via
  múltiplos Repos. Por isso a sessão é estabelecida **no use-case** (que pode orquestrar vários services):
  `createUserService` cria a conta e o use-case chama `signInService` em seguida.
- `uploadDriverDocumentService` (singular, `AppResultAsync`, sem validação de arquivo — delega ao Zod) já
  existe e é usado por `addDriverApplicationUseCase`; reutilizar chamando 2x. A variante plural
  `uploadDriverDocumentsService` (com `MSG_*` e validação própria) fica redundante e é removida.
- A RPC `register_driver_application` (presente só em `supabase/old-migrations/`) torna-se obsoleta e **não**
  deve ser portada para o set consolidado.
- Rodar `npm run fix:biome && npm run lint:biome && npm run typecheck` antes de finalizar.

## Success Metrics

- Cadastro de motorista novo (email inédito) volta a funcionar de ponta a ponta (hoje quebrado pela trigger).
- Zero referências a `register_driver_application` (RPC) e a `*Step` no fluxo de motorista.
- Use-case do fluxo sem nenhuma ocorrência de `MSG_`/`message`; Action concentra 100% da tradução.
- Nenhum arquivo do fluxo em `server/slices/`; nenhum service órfão remanescente (grep limpo).
- `db:reset` + `typecheck` + `lint` verdes.

## Open Questions

1. **Acúmulo de versões de documento após `rejected`.** Reaplicação após candidatura `rejected` gera novos
   arquivos (UUID aleatório) e deixa os antigos referenciados pela linha `rejected`. Fora de escopo deste
   PRD (decisão de lifecycle de documentos); permanece em aberto, sem ação aqui.

---

**Resolvidas** (mantidas aqui como registro; não são mais pontos em aberto):

- **Falha de membership: deslogar ou não?** Resolvido: **nunca deslogar**, nem no modo `new` nem no
  `existing`. Quem criou conta/logou mas não conseguiu membership fica autenticado, e o dashboard-guard o
  redireciona (provavelmente para `/join`). Na prática: o driver não adiciona `signOutService`, e as 3
  chamadas existentes no `registerAndJoinUseCase` são removidas (US-004 / FR-12).
- **Onde estabelecer a sessão do usuário novo.** Resolvido: **no use-case**, chamando `signInService` após
  `createUserService`. `createUserService` não é alterado (não estabelece sessão nem chama repo de login),
  respeitando a regra de que Service não orquestra "criar + logar". Como `createUserService` fica intacto,
  não há impacto para seus callers (hoje só `registerAndJoinUseCase`).
- **Upload: refatorar o plural ou reusar o singular?** Resolvido: **reusar** `uploadDriverDocumentService`
  (singular), chamando-o 2x no use-case como faz `addDriverApplicationUseCase`; a variante plural é removida
  (US-003 / US-009).

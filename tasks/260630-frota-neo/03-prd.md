# PRD: Frota NEO

## 1. Introduction/Overview

Frota NEO é um novo módulo (`fleet`) que adiciona um caminho de cadastro específico para pessoas que querem atuar como **motoristas da frota** de uma organização. Hoje o onboarding só permite entrar na organização como membro comum; não há como captar motoristas com os dados operacionais necessários (placa, tipo de veículo, documentos) nem moderar quem pode de fato atuar como motorista.

O candidato acessa `/fleet/signup`, preenche os mesmos dados do cadastro atual (`register-and-join`) mais dados do veículo e documentos (CRLV, CNH), e ao concluir **já entra na organização** (membership normal). É criada uma **candidatura de motorista** (`driver_application`) com status `pending`. Um membro com a **nova permission de gestão de frota** aprova ou rejeita. A aprovação decide **apenas** se a pessoa se torna motorista — nunca o pertencimento à organização.

## 2. Goals

- Permitir que interessados se cadastrem como motoristas via `/fleet/signup`, reaproveitando o cadastro atual e o link de convite (`?ref=`).
- Garantir entrada imediata na organização, independente da aprovação como motorista.
- Capturar dados do veículo (placa, tipo, modelo/ano/cor) e documentos sensíveis (CRLV, CNH) de forma segura.
- Registrar uma candidatura de motorista (`pending`) de forma atômica com a entrada na organização.
- Permitir que um membro autorizado aprove ou rejeite candidaturas, criando o registro de motorista (`drivers`) quando aprovado.
- Não introduzir estado parcial inconsistente em caso de falha (atomicidade + compensação).

## 3. User Stories

### US-001: Migration — tabelas de frota
**Description:** As a developer, I need persistir candidaturas e motoristas para suportar o fluxo de frota.

**Acceptance Criteria:**
- [ ] Criar tabela `driver_applications` com: `id`, `organization_id` (FK), `user_id` (FK), `plate`, `vehicle_type` (enum fixo), `vehicle_model` (nullable), `vehicle_year` (nullable), `vehicle_color` (nullable), `crlv_document_path`, `cnh_document_path`, `status` (`pending` | `approved` | `rejected`, default `pending`), `reviewed_by_user_id` (nullable), `reviewed_at` (nullable), `created_at`, `updated_at`.
- [ ] Criar tabela `drivers` com: `id`, `organization_id` (FK), `user_id` (FK), `driver_application_id` (FK), `plate`, `vehicle_type`, dados do veículo, `is_active`, `created_at`.
- [ ] Enum/constraint de `vehicle_type` com valores fixos (ex.: `car`, `motorcycle`, `van`, `truck`).
- [ ] Constraint de **placa única por organização** entre candidaturas ativas (`pending`/`approved`) e/ou na tabela `drivers` — permitindo reenvio após `rejected`.
- [ ] FKs com `on delete cascade` para `organizations` e consistentes com `users`.
- [ ] `npm run db:gen-types` atualizado; typecheck passa.

### US-002: Migration — permission de gestão de frota
**Description:** As an organization admin, I need uma permission dedicada para aprovar/gerir candidaturas de frota.

**Acceptance Criteria:**
- [ ] Seed de uma nova permission (key em inglês, ex.: `fleet.applications.manage`) em `public.permissions` com `on conflict (key) do update`.
- [ ] Grant da permission aos roles de sistema `OWNER` e `ADMIN` em todas as organizações (`on conflict do nothing`), seguindo o padrão dos seeds existentes.
- [ ] Registrar a mesma key em `src/modules/auth/shared/permissions.ts` (`PERMISSIONS`), senão `listMembershipPermissionsService` a descarta.
- [ ] Typecheck passa.

### US-003: Migration — RPC transacional de cadastro de motorista
**Description:** As a developer, I need criar membership + driver_application numa única transação para garantir atomicidade.

**Acceptance Criteria:**
- [ ] RPC Postgres (`plpgsql`, `volatile`) que, numa transação: garante membership ativa (role `MEMBER`) se ainda não existir e insere `driver_application` `pending`.
- [ ] Recebe: organização, user, dados do veículo, paths dos documentos, `invited_by_user_id` opcional.
- [ ] Retorna ids criados (`membership`/`driver_application`) e/ou código de erro tratável (ex.: placa duplicada, candidatura pending existente).
- [ ] Respeita a constraint de placa única por org e a regra de reenvio (`pending` bloqueia, `rejected` libera).
- [ ] Revisar `security definer` e permissões de execução.
- [ ] Typecheck passa.

### US-004: Storage privado para documentos
**Description:** As a candidate, I need enviar CRLV e CNH com segurança, sem exposição pública.

**Acceptance Criteria:**
- [ ] Bucket **privado** para documentos de frota (nome em inglês).
- [ ] Repo admin de upload (`*.admin.repo.ts`) que salva em path por `userId` (ex.: `fleet/{organizationId}/{userId}/{uuid}.{ext}`), `upsert:false`.
- [ ] Repo para gerar **signed URL** de curta duração (server-only) para leitura pelo aprovador.
- [ ] Policies do bucket restringem leitura a acesso via server (admin/signed URL); nada público.
- [ ] Typecheck passa.

### US-005: Schema e validação do signup de motorista
**Description:** As a developer, I need validar o input do signup de frota (dados base + veículo + documentos).

**Acceptance Criteria:**
- [ ] Schema server no módulo `fleet` estendendo os campos do `registerAndJoinSchemaServer` + `plate`, `vehicleType` (enum), `vehicleModel?`, `vehicleYear?`, `vehicleColor?` e referências/arquivos dos documentos.
- [ ] Placa, tipo, CRLV e CNH **obrigatórios**; modelo/ano/cor opcionais.
- [ ] Validação de formato de placa e de tipos de arquivo/imagem aceitos para documentos.
- [ ] Schema client correspondente para o formulário.
- [ ] Typecheck passa.

### US-006: Use-case de cadastro como motorista
**Description:** As a candidate, I want me cadastrar e entrar na organização gerando uma candidatura de motorista atômica.

**Acceptance Criteria:**
- [ ] Novo `registerAndJoinAsDriverUseCase` no módulo `fleet` que **reusa os steps** do onboarding (resolver org por host, resolver `ref`, sign-up/sign-in, criar public user/profile p/ novo) + novos steps de frota.
- [ ] Upload dos documentos ocorre **após** garantir o usuário; os paths são passados à RPC.
- [ ] Chama a RPC transacional (US-003) para membership + `driver_application`.
- [ ] **Compensação em falha:** se a RPC/pós-upload falhar, remove arquivos enviados; se o usuário era novo, deleta o auth user (padrão `deleteAuthUserService`).
- [ ] Usuário já existente (`existing`): não altera `public.users`/`user_profiles`, apenas cria a candidatura (respeitando `pending` bloqueia / `rejected` libera).
- [ ] Mensagens centralizadas em `MSG_*`; `prefixLog` no padrão; etapas comentadas e numeradas.
- [ ] Retorna `OperationResponse` com DTO específico; typecheck passa.

### US-007: Action e página pública de signup de frota
**Description:** As a candidate, I want uma página em `/fleet/signup` para me cadastrar como motorista.

**Acceptance Criteria:**
- [ ] `registerAndJoinAsDriverAction` valida o schema server e chama o use-case; normaliza snake_case → camelCase.
- [ ] Rota `/fleet/signup` (Server Component compondo um form client) com os campos base + veículo + upload de CRLV/CNH.
- [ ] Propaga `?ref=` da URL para o use-case.
- [ ] Feedback de sucesso/erro ao usuário; entrada na organização confirmada mesmo com candidatura `pending`.
- [ ] Typecheck/lint passam.
- [ ] Verify in browser using dev-browser skill.

### US-008: Listagem de candidaturas pendentes
**Description:** As an authorized member, I want ver as candidaturas de motorista pendentes para revisá-las.

**Acceptance Criteria:**
- [ ] Use-case protegido por `hasMembershipPermissionService(PERMISSIONS.<fleet manage>)` após autenticar e resolver tenant.
- [ ] Lista candidaturas `pending` da organização com dados do candidato e do veículo.
- [ ] Documentos exibidos via **signed URL** gerada no server (sem URL pública persistida).
- [ ] Usuário sem permissão recebe negação; typecheck/lint passam.
- [ ] Verify in browser using dev-browser skill.

### US-009: Aprovar ou rejeitar candidatura
**Description:** As an authorized member, I want aprovar ou rejeitar uma candidatura para controlar quem atua como motorista.

**Acceptance Criteria:**
- [ ] Action(s)/use-case protegidos pela permission de frota, validando que a candidatura pertence à organização atual e está `pending`.
- [ ] **Aprovar:** cria/ativa registro em `drivers` vinculado ao usuário/org/veículo; marca candidatura `approved` com `reviewed_by_user_id`/`reviewed_at`.
- [ ] **Rejeitar:** marca candidatura `rejected` com auditoria; usuário **permanece membro** da organização.
- [ ] Revalida a rota da listagem após sucesso.
- [ ] Idempotência: candidatura já revisada não pode ser aprovada/rejeitada de novo.
- [ ] Typecheck/lint passam.
- [ ] Verify in browser using dev-browser skill.

### US-010: Índices backend do módulo fleet
**Description:** As a developer, I need mapear o backend do novo módulo para manutenção.

**Acceptance Criteria:**
- [ ] Criar `src/modules/fleet/server/BACKEND_INDEX.md` com entrypoints, use-cases, steps, services, repos e call matrix.
- [ ] Atualizar o `BACKEND_INDEX.md` raiz incluindo o módulo `fleet` e suas dependências.
- [ ] Typecheck passa.

## 4. Functional Requirements

- FR-1: O sistema deve expor `/fleet/signup` que resolve a organização pelo host e aceita `?ref=`.
- FR-2: O formulário deve exigir os campos do cadastro atual + `plate`, `vehicleType` (enum fixo), CRLV e CNH; `vehicleModel`/`vehicleYear`/`vehicleColor` são opcionais.
- FR-3: Ao submeter, o sistema deve garantir a entrada imediata do usuário na organização (membership `MEMBER`), independente da aprovação como motorista.
- FR-4: O sistema deve criar uma `driver_application` com status `pending` referenciando os paths dos documentos.
- FR-5: A criação de membership + `driver_application` deve ocorrer em uma única transação (RPC); Auth e upload ficam fora, com compensação manual em falha.
- FR-6: Documentos devem ser armazenados em bucket privado e acessados apenas via signed URL gerada no server.
- FR-7: A placa deve ser única por organização entre candidaturas ativas/motoristas; uma candidatura `rejected` libera nova submissão; uma `pending` bloqueia.
- FR-8: Usuário cujo email já é membro deve gerar apenas a candidatura, sem alterar `public.users`/`user_profiles`.
- FR-9: O sistema deve prover uma nova permission (key em inglês) semeada para `OWNER` e `ADMIN`, registrada também em `PERMISSIONS`.
- FR-10: Apenas membros com essa permission podem listar candidaturas `pending` e aprovar/rejeitar.
- FR-11: Ao aprovar, o sistema deve criar/ativar um registro em `drivers` e marcar a candidatura `approved` com auditoria; ao rejeitar, marcar `rejected` mantendo a membership.
- FR-12: Erros ao candidato não devem vazar se o email já existe (mensagem neutra, padrão atual).

## 5. Non-Goals (Out of Scope)

- Painel completo de gestão/listagem/filtros de motoristas aprovados e histórico.
- Edição/reenvio de documentos pelo próprio motorista após submissão.
- Notificações por email de aprovação/rejeição.
- Fluxo de expiração/renovação de documentos (CNH vencida, etc.).
- Métricas/insights de frota.
- Tipos de veículo configuráveis por organização (enum é fixo no v1).
- Qualquer alteração na regra de entrada na organização (entrada continua imediata e independente da aprovação).
- Atribuição de qualquer role específica ao motorista aprovado (é registro em `drivers`, não role).

## 6. Design Considerations

- Reusar primitives de `src/shared/components/ui/` (form, input, button, card, table, dialog) e o padrão de formulário do `register-and-join-form.tsx` como referência.
- Formulário de frota deve estender visualmente o cadastro atual com uma seção de veículo + upload de documentos.
- UI específica do módulo fica em `src/modules/fleet/shared/ui/`.
- `page.tsx` como Server Component compondo um form client (`"use client"`).

## 7. Technical Considerations

- **Módulos envolvidos (scan):** `fleet` (novo, primary), reuso de `accounts/onboarding`, `organizations/memberships`, `auth`, `accounts/users` + `profiles`; referência de Storage em `organizations`.
- **Extensão do fluxo:** novo `registerAndJoinAsDriverUseCase` reusa os steps existentes; não modificar o `registerAndJoinUseCase` comum além do necessário para reuso.
- **RPC transacional é padrão novo:** as RPCs atuais são `stable` read-only; a nova é de escrita (`volatile`, provável `security definer`) — revisar segurança e execução.
- **Storage privado + signed URL é padrão novo:** só existe bucket público (`public-assets`) hoje; definir bucket privado, repos de upload/signed URL e policies.
- **Catálogo de permissões:** a nova key precisa estar em `auth/shared/permissions.ts`, senão o guard/UI do aprovador não a enxerga (`listMembershipPermissionsService` filtra por `PERMISSIONS`).
- **Comportamentos a preservar:** rollback de auth user novo; best-effort de `ref`/welcome email; mensagem neutra p/ email existente; membership imediata `MEMBER` + `invited_by_user_id`; DTOs (não retornar entidade crua).
- **Consistência de arquivos:** em falha após upload, limpar arquivos do Storage para evitar órfãos.
- **Convenções (AGENTS):** `Action -> Use-case -> Service(s) -> Repo(s)`; repos admin em `*.admin.repo.ts`; sem barrel files; `MSG_*` e etapas numeradas no use-case; nada de lógica de domínio em `src/app/`.

## 8. Success Metrics

- Um candidato completa o cadastro em `/fleet/signup` e, ao final, está como membro da organização **e** tem uma `driver_application` `pending`.
- Nenhum estado parcial em falha: sem auth user órfão nem arquivo órfão (verificável em teste de falha da RPC).
- A mesma placa não é registrada por dois donos na mesma organização.
- Documentos nunca ficam acessíveis por URL pública; apenas via signed URL server-side.
- Um membro com a permission aprova/rejeita candidaturas; após aprovação existe registro em `drivers`; após rejeição o usuário continua membro.
- `npm run fix:biome && npm run lint:biome && npm run typecheck` passam.

## 9. Open Questions

- Nomes finais: key exata da permission, nomes das tabelas/enum e do bucket privado (a confirmar no Technical Plan).
- Assinatura precisa da RPC (parâmetros/retorno e mapeamento de códigos de erro para o use-case).
- Formato/estratégia exata da constraint parcial de placa para conviver com histórico `rejected` (unique parcial em `driver_applications` vs unicidade em `drivers`).
- Validação de placa: apenas formato Mercosul/antigo brasileiro ou aceitar ambos.
- Tempo de expiração das signed URLs para leitura de documentos pelo aprovador.

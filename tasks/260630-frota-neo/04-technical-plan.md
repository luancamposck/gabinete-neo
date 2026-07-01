# Technical Plan: Frota NEO

## 1. Overview

Implementa o módulo `fleet`: um signup público de motorista em `/fleet/signup` que reusa o fluxo de `register-and-join`, faz upload de documentos (CRLV/CNH) em bucket **privado** e cria — de forma atômica via **RPC transacional** — a membership imediata na organização + a `driver_application` `pending`. Um segundo fluxo, autenticado e protegido por uma **nova permission** (`fleet.applications.manage`), lista candidaturas pendentes e permite aprovar (criando registro em `drivers`) ou rejeitar. Decisão técnica central: **atomicidade da parte de dados dentro de uma RPC Postgres**, com Auth e Storage fora da transação e compensados manualmente no use-case (padrão já existente de `deleteAuthUserService` + cleanup de arquivos).

## 2. Inputs Reviewed

| File | Status | Notes |
|---|---|---|
| `01-brief.md` | `ok` | Escopo v1, decisões de produto e link de convidado (`?ref=`) |
| `02-context-scan.md` | `ok` | Módulos, padrões, riscos e decisões técnicas já mapeados |
| `03-prd.md` | `ok` | US-001 a US-010 e FR-1 a FR-12 usados como base |
| Código real (onboarding, memberships, auth, org storage, RBAC migrations) | `ok` | Padrões confirmados: steps + use-case, RPC repos, admin client, upload via FormData, error-code unions |

## 3. Technical Assumptions

Com base no PRD e Context Scan, este plano assume:

- Módulo dono é `fleet` (novo), seguindo `Action -> Use-case -> Service(s) -> Repo(s)`.
- O fluxo de signup **reusa steps existentes** de `accounts/onboarding` (`resolveOrganizationIdByHostStep`, `resolveInviterByRefStep`, `signUpOrSignInStep`, `createPublicUserAndProfileStep`, `recordReferralStep`) + `sendWelcomeEmailService`, e substitui `ensureMembershipStep` pela RPC transacional.
- A RPC cobre **membership + `driver_application`**; criação de `public.users`/`user_profiles` continua no step existente (com rollback de auth user para usuário novo).
- Documentos são enviados via `FormData` para a Server Action (padrão do upload de OG image), com validação server-side.
- Escritas do signup usam **admin client** (padrão do onboarding), pois a sessão pode não estar plenamente estabelecida no momento do cadastro.
- O fluxo de aprovação é autenticado e usa `hasMembershipPermissionService` com a nova key.
- Placa é normalizada (uppercase, sem separadores) para a constraint de unicidade por organização.
- Nenhuma arquitetura nova de módulos é criada; nomes em inglês.

Corrija qualquer assumption incorreta.

## 4. Module Ownership

| Módulo/Submódulo | Papel | Motivo |
|---|---|---|
| `fleet` (novo) | `owner` | Signup de motorista, candidatura, storage privado, aprovação |
| `accounts/onboarding` | `dependency` | Reuso dos steps do `register-and-join` |
| `accounts/users` + `accounts/users/profiles` | `dependency` | Criação de `public.users`/`user_profiles` (usuário novo) |
| `auth` | `dependency` | `signUp`, `deleteAuthUser`, `hasMembershipPermission`; catálogo `PERMISSIONS` (update) |
| `organizations` | `dependency` | Resolver tenant por host; referência de padrão de Storage |
| `organizations/memberships` | `dependency` | Convenção de membership/role `MEMBER` (agora via RPC) |
| `emails` | `dependency` | Welcome email best-effort |
| `organizations/referrals` | `unchanged` | Referral segue via `recordReferralStep` reusado |

## 5. Proposed Architecture

### Fluxo A — Signup de motorista (público)
`registerAndJoinAsDriverAction(FormData)` → valida schema server (campos base + veículo + arquivos) → `registerAndJoinAsDriverUseCase`:

1. `resolveOrganizationIdByHostStep` (reuso) — resolve `organizationId`/host.
2. `resolveInviterByRefStep` (reuso) — resolve `?ref=` best-effort.
3. `signUpOrSignInStep` (reuso) — `mode: "new" | "existing"`, mensagem neutra p/ email existente.
4. Se `new`: `createPublicUserAndProfileStep` (reuso) — cria `public.users`/`user_profiles`; em falha, `deleteAuthUserService` (rollback existente).
5. **`uploadDriverDocumentsStep` (novo)** — upload de CRLV/CNH no bucket privado (path por `userId`); retorna `crlvPath`/`cnhPath`. Em falha: compensa (remove arquivos já enviados) e, se `new`, deleta auth user.
6. **`createDriverApplicationStep` (novo)** — chama a RPC transacional (`register_driver_application`) que, numa transação: garante membership `MEMBER` (se não membro) + insere `driver_application` `pending`; valida placa única por org e regra de reenvio. Em falha: compensa arquivos + (se `new`) deleta auth user.
7. Best-effort: `sendWelcomeEmailService` (se `joinedNow`) e `recordReferralStep` (se ref válida + `joinedNow`).
8. Retorna DTO `{ organizationId, userId, applicationId }`.

### Fluxo B — Aprovação (autenticado, dashboard)
- `getPendingDriverApplicationsAction` → use-case: auth → resolve org por host → `hasMembershipPermissionService("fleet.applications.manage")` → lista `pending` da org → gera **signed URLs** dos documentos → DTO.
- `approveDriverApplicationAction` / `rejectDriverApplicationAction` → use-case de review: auth → resolve org → permissão → carrega candidatura (mesma org, status `pending`) → **aprovar** (cria/ativa `drivers` + marca `approved` com auditoria) ou **rejeitar** (marca `rejected`, mantém membership) → `revalidatePath` da listagem. Guard de idempotência (não reprocessar candidatura já revisada).

### Reuso e novas abstrações
- Reuso direto dos steps de onboarding (funções que retornam `OperationResponse`).
- Novas abstrações: steps de upload/aplicação, services de storage privado (upload/signed-url/remove), service que envolve a RPC, services de listagem/approve/reject, repos admin correspondentes.
- Aprovar idealmente atômico (insert `drivers` + update `driver_application`): preferir RPC `approve_driver_application` ou ordenar update-antes/insert com idempotência (ver §14).

## 6. File Plan

| Ação | Arquivo | Motivo |
|---|---|---|
| `create` | `src/modules/fleet/server/slices/register-as-driver/actions/register-and-join-as-driver.action.ts` | Entrypoint público (FormData) |
| `create` | `src/modules/fleet/server/slices/register-as-driver/use-cases/register-and-join-as-driver.use-case.ts` | Orquestra signup + upload + RPC + compensação |
| `create` | `src/modules/fleet/server/slices/register-as-driver/steps/upload-driver-documents.step.ts` | Upload CRLV/CNH + cleanup |
| `create` | `src/modules/fleet/server/slices/register-as-driver/steps/create-driver-application.step.ts` | Chama a RPC transacional |
| `create` | `src/modules/fleet/server/slices/list-driver-applications/actions/get-pending-driver-applications.action.ts` | Entrypoint da listagem |
| `create` | `src/modules/fleet/server/slices/list-driver-applications/use-cases/get-pending-driver-applications.use-case.ts` | Guard de permissão + listagem + signed URLs |
| `create` | `src/modules/fleet/server/slices/review-driver-application/actions/approve-driver-application.action.ts` | Aprovar candidatura |
| `create` | `src/modules/fleet/server/slices/review-driver-application/actions/reject-driver-application.action.ts` | Rejeitar candidatura |
| `create` | `src/modules/fleet/server/slices/review-driver-application/use-cases/review-driver-application.use-case.ts` | Orquestra approve/reject com auditoria |
| `create` | `src/modules/fleet/server/services/register-driver-application.service.ts` | Envolve a RPC (mapeia error codes) |
| `create` | `src/modules/fleet/server/services/upload-driver-documents.service.ts` | Valida arquivo + chama repo de upload |
| `create` | `src/modules/fleet/server/services/create-driver-document-signed-url.service.ts` | Gera signed URL server-only |
| `create` | `src/modules/fleet/server/services/list-pending-driver-applications.service.ts` | Lista candidaturas pendentes |
| `create` | `src/modules/fleet/server/services/approve-driver-application.service.ts` | Cria driver + marca approved |
| `create` | `src/modules/fleet/server/services/reject-driver-application.service.ts` | Marca rejected |
| `create` | `src/modules/fleet/server/repos/register-driver-application.admin.repo.ts` | `rpc("register_driver_application", ...)` |
| `create` | `src/modules/fleet/server/repos/upload-driver-document.admin.repo.ts` | Upload em bucket privado |
| `create` | `src/modules/fleet/server/repos/create-signed-document-url.admin.repo.ts` | `createSignedUrl` |
| `create` | `src/modules/fleet/server/repos/delete-driver-document.admin.repo.ts` | Cleanup de arquivos |
| `create` | `src/modules/fleet/server/repos/list-pending-driver-applications.repo.ts` | Query SSR de candidaturas |
| `create` | `src/modules/fleet/server/repos/get-driver-application-by-id.admin.repo.ts` | Carregar candidatura alvo |
| `create` | `src/modules/fleet/server/repos/insert-driver.admin.repo.ts` | Inserir em `drivers` (se não via RPC) |
| `create` | `src/modules/fleet/server/repos/update-driver-application-status.admin.repo.ts` | Update de status/auditoria |
| `create` | `src/modules/fleet/shared/validations/register-as-driver.schema.ts` | Schema client/server do signup |
| `create` | `src/modules/fleet/shared/validations/vehicle.schema.ts` | Placa + enum de tipo + docs |
| `create` | `src/modules/fleet/shared/constants/vehicle-types.ts` | Enum fixo de tipos |
| `create` | `src/modules/fleet/shared/types/inputs.ts` | Params do use-case/services |
| `create` | `src/modules/fleet/shared/types/db.ts` | Tipos derivados das tabelas |
| `create` | `src/modules/fleet/shared/ui/register-as-driver-form.tsx` | Form client do signup |
| `create` | `src/modules/fleet/shared/ui/driver-applications-list.tsx` | UI da listagem/aprovação |
| `create` | `src/app/fleet/signup/page.tsx` | Rota pública (Server Component compondo o form) |
| `create` | `src/app/dashboard/fleet/applications/page.tsx` | Rota de aprovação (a confirmar caminho) |
| `create` | `src/modules/fleet/server/BACKEND_INDEX.md` | Índice backend do módulo |
| `update` | `src/modules/auth/shared/permissions.ts` | Registrar `FLEET_APPLICATIONS_MANAGE` |
| `update` | `BACKEND_INDEX.md` (raiz) | Adicionar módulo `fleet` + dependências |
| `read-only` | `.../register-and-join/steps/*.ts` | Steps reusados |
| `read-only` | `src/modules/organizations/server/repos/upload-organization-og-image.admin.repo.ts` | Padrão de upload |
| `read-only` | `src/modules/auth/server/services/has-membership-permission.service.ts` | Guard de permissão |
| `create` | `supabase/migrations/<ts>_create_driver_applications_and_drivers.sql` | Tabelas + constraints + índices |
| `create` | `supabase/migrations/<ts>_seed_permission_fleet_applications_manage.sql` | Permission + grant OWNER/ADMIN |
| `create` | `supabase/migrations/<ts>_rpc_register_driver_application.sql` | RPC transacional de cadastro |
| `create` | `supabase/migrations/<ts>_storage_fleet_documents_bucket.sql` | Bucket privado + policies |
| `maybe` | `supabase/migrations/<ts>_rpc_approve_driver_application.sql` | Aprovação atômica (ver §14) |
| `update` | `src/shared/types/supabase.ts` | Regerar via `npm run db:gen-types` |

## 7. Data / Database Plan

### Tabelas afetadas / criadas
- **`driver_applications`** (nova): `id` uuid pk, `organization_id` uuid fk→organizations (cascade), `user_id` uuid fk (mesma convenção de `organization_memberships.user_id`), `plate` text (normalizada), `vehicle_type` text, `vehicle_model` text null, `vehicle_year` int null, `vehicle_color` text null, `crlv_document_path` text not null, `cnh_document_path` text not null, `status` text default `pending`, `reviewed_by_user_id` uuid null, `reviewed_at` timestamptz null, `created_at`/`updated_at` timestamptz default now().
- **`drivers`** (nova): `id` uuid pk, `organization_id` fk, `user_id`, `driver_application_id` fk→driver_applications, `plate`, `vehicle_type`, model/year/color, `is_active` bool default true, `created_at`.

### Constraints / índices
- `check` de `status in ('pending','approved','rejected')`.
- `check` de `vehicle_type` contra o enum fixo (text + check; alternativa: tipo enum Postgres — ver §14).
- **Unique parcial de placa por org**: índice único em `(organization_id, plate)` `where status in ('pending','approved')` em `driver_applications` (permite reenvio após `rejected`); reforço opcional em `drivers` `where is_active`.
- Índices em `(organization_id, status)` para a listagem de pendentes; FKs indexadas.

### RPC (migration)
- `register_driver_application(p_organization_id uuid, p_user_id uuid, p_plate text, p_vehicle_type text, p_vehicle_model text, p_vehicle_year int, p_vehicle_color text, p_crlv_path text, p_cnh_path text, p_invited_by_user_id uuid)` → retorna `application_id uuid`, `joined_now boolean`, `error_code text`. `plpgsql`, `volatile`, `security definer`, `search_path` fixado. Corpo transacional: lookup role `MEMBER` da org; se não é membro, insere membership (captura `joined_now`); valida placa/candidatura pendente (retorna `error_code` `plate_taken`/`application_pending_exists`); insere `driver_application`.
- `maybe` `approve_driver_application(p_application_id uuid, p_reviewer_user_id uuid)` → `driver_id uuid`, `error_code text` (insert `drivers` + update status atômico).

### Storage (migration)
- Bucket privado `fleet-documents` (via `insert into storage.buckets`), `public = false`, policies restringindo acesso (leitura só via service role/signed URL).

### Tipos Supabase
- Regerar `supabase.ts` com `npm run db:gen-types` após as migrations.

## 8. Contracts

### Signup
- **Input (action):** `FormData` com campos base (`name`, `username`, `phone`, `email`, `password`, endereço, `ref?`, `relationshipToInviter?`), `plate`, `vehicleType`, `vehicleModel?`, `vehicleYear?`, `vehicleColor?`, `crlv` (File), `cnh` (File).
- **Use-case input:** objeto normalizado (snake→camel) + `crlvPath`/`cnhPath` após upload.
- **Output:** `OperationResponse<{ organizationId: string; userId: string; applicationId: string }, RegisterAsDriverCode>`.
- **Códigos:** `invalid_input | invalid_file | org_not_found | plate_taken | application_pending_exists | infra_error` (email existente → mensagem **neutra**, sem código que vaze).

### Listagem
- **Output:** `OperationResponse<{ applications: DriverApplicationDTO[] }, "unauthenticated" | "org_not_found" | "not_allowed" | "infra_error">`. `DriverApplicationDTO` inclui dados do candidato/veículo + `crlvSignedUrl`/`cnhSignedUrl` (curta duração), sem paths crus.

### Review
- **Input:** `{ applicationId: string }`.
- **Output:** `OperationResponse<{ applicationId: string; status: "approved" | "rejected" }, "unauthenticated" | "org_not_found" | "not_allowed" | "not_found" | "already_reviewed" | "infra_error">`.

## 9. Validation & Security

- **Zod server-side** em todos os inputs; placa validada por formato (Mercosul/antigo — ver §14) e normalizada; `vehicleType` restrito ao enum; documentos validados por MIME/tamanho (imagem/PDF).
- **Signup público**: sem auth; escritas via **admin client** (padrão onboarding). Mensagem neutra para email já existente.
- **Aprovação**: exige `getCurrentAuthUserService` + tenant por host + `hasMembershipPermissionService("fleet.applications.manage")`. Candidatura precisa pertencer à **org atual** (isolamento multi-tenant) e estar `pending`.
- **Documentos (PII)**: bucket **privado**; nunca URL pública; signed URL só gerada **após** checagem de permissão + posse pela org, com TTL curto.
- **RPC** `security definer` com `search_path` fixado para evitar hijack; concede execução apenas ao role de serviço.
- **Catálogo de permissões**: `fleet.applications.manage` registrada em `PERMISSIONS`, senão `listMembershipPermissionsService` a descarta silenciosamente.

## 10. Side Effects & Integrations

| Efeito | Bloqueante? | Notas |
|---|---|---|
| Upload CRLV/CNH (Storage privado) | Sim | Necessário antes da RPC; cleanup em falha |
| RPC `register_driver_application` | Sim | Membership + candidatura atômicas |
| `deleteAuthUserService` (compensação) | Sim (em falha) | Só p/ usuário `new` |
| Cleanup de arquivos (compensação) | Sim (em falha) | Remove CRLV/CNH órfãos |
| Welcome email | Não (best-effort) | Só quando `joinedNow` |
| Registro de referral | Não (best-effort) | Só se ref válida + `joinedNow` |
| `revalidatePath` da listagem | Sim (pós-approve/reject) | Atualiza UI do aprovador |

## 11. Error Strategy

- Seguir o padrão de `uploadOrganizationOgImageUseCase`/onboarding: `MSG_*` no topo, `FALLBACK_INFRA_ERROR`, `prefixLog = "[registerAndJoinAsDriverUseCase]:"`, etapas comentadas e numeradas.
- **Esperados** (mapeados para mensagem amigável): `invalid_input`, `invalid_file`, `plate_taken`, `application_pending_exists`, `org_not_found`, `not_allowed`, `not_found`, `already_reviewed`. Códigos de erro da RPC traduzidos no service.
- **Inesperados**: `infra_error` genérico + `console.error`.
- **Compensação**: falha pós-upload → remove arquivos; falha com usuário `new` → deleta auth user. Ordem garante que não sobra auth user nem arquivo órfão no caminho feliz de erro.
- **Neutralidade**: nunca revelar se o email já existe.

## 12. Documentation Updates

- `create` `src/modules/fleet/server/BACKEND_INDEX.md` (entrypoints, use-cases, steps, services, repos, call matrix, fluxos, comportamentos de compensação).
- `update` `BACKEND_INDEX.md` raiz: adicionar `fleet` na tabela de módulos e no bloco de dependências.
- `update` nota em `auth` sobre a nova permission key (se o índice do `auth` listar keys).

## 13. Risks & Trade-offs

| Risco | Impacto | Mitigação |
|---|---|---|
| Reuso de steps slice-internos do onboarding cria acoplamento cross-módulo | Médio | Aceitar reuso direto agora; avaliar promover steps a local compartilhado se crescer (§14) |
| Órfãos se o processo cair entre upload e cleanup | Médio | Cleanup no `catch`; limpeza agendada fica fora do v1 |
| RPC `security definer` mal configurada | Alto | `search_path` fixo, escopo mínimo, revisão de grants |
| Aprovação não atômica (driver órfão) | Médio | RPC `approve_driver_application` ou ordenação + idempotência |
| Unique parcial de placa vs histórico `rejected` | Médio | Índice único parcial só sobre `pending`/`approved` |
| Payload grande (2 arquivos + campos) via Server Action | Baixo | Validar tamanho; respeitar limites de body |
| Bucket privado + signed URL é padrão novo no repo | Médio | Encapsular em repos dedicados; TTL curto |

## 14. Resolved Technical Decisions

- **TTL das signed URLs**: **300s (5 min)**.
- **Aprovação atômica**: **RPC dedicada `approve_driver_application`** (insert `drivers` + update status na mesma transação).
- **Reuso dos steps**: **importar diretamente** os steps de `accounts/onboarding` (acoplamento aceito no v1).
- **`vehicle_type`**: **text + check constraint** (não enum nativo).
- **FK de `user_id`**: **`public.users(id)`** (confirmado no código: mesma convenção de memberships/referrals/invites/tasks).
- **Formato de placa**: aceitar **Mercosul e antigo** (`ABC1D23` e `ABC1234`).
- **Rota de aprovação**: **`/dashboard/config/fleet`**.
- **Nomes finais**: bucket **`fleet-documents`**; permission **`fleet.applications.manage`**.
- **Enum de tipos de veículo**: `car`, `motorcycle`, `van`, `truck`.

## 15. Next Step

As Open Technical Questions são de detalhe e **não bloqueiam** o início da implementação (têm defaults razoáveis). Próximo passo: **Ralph Breakdown** (`/ralph`) para converter este plano + o PRD em tarefas pequenas e executáveis, começando pela camada de dados (migrations + RPC + tipos), depois storage, signup e aprovação.

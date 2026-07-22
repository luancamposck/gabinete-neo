# fleet/server

Indice da camada server-side de `fleet`.

Este arquivo serve como mapa rapido para entender entrypoints, arquivos principais, dependencias e fluxos backend deste modulo.

---

## Visao geral

Este modulo concentra o cadastro de motoristas, armazenamento privado de documentos de frota, candidaturas de motorista e revisao de candidaturas.

O backend combina fluxos legados em `slices/` com os novos entrypoints flat:

- `register-as-driver`: signup publico de motorista (action -> use-case -> steps -> services/repos), com Storage privado de documentos e registro via RPC transacional.
- `get-pending-driver-applications`: listagem autenticada e protegida de candidaturas pendentes, em `actions/` e `use-cases/`.
- `review-driver-application`: aprovar e rejeitar candidaturas, nos entrypoints flat.

---

## Entrypoints

| Entrypoint | Caminho | Responsabilidade |
|---|---|---|
| `registerAndJoinAsDriverAction` | `./slices/register-as-driver/actions/register-and-join-as-driver.action.ts` | Valida `FormData` do signup de motorista e chama o use-case |
| `getPendingDriverApplicationsAction` | `./actions/get-pending-driver-applications.action.ts` | Lista candidaturas pendentes da org autenticada |
| `approveDriverApplicationAction` | `./actions/approve-driver-application.action.ts` | Aprova uma candidatura e revalida a pagina de frota |
| `rejectDriverApplicationAction` | `./actions/reject-driver-application.action.ts` | Rejeita uma candidatura e revalida a pagina de frota |

---

## Use-cases locais

| Use-case | Caminho | Responsabilidade |
|---|---|---|
| `registerAndJoinAsDriverUseCase` | `./slices/register-as-driver/use-cases/register-and-join-as-driver.use-case.ts` | Reusa steps de onboarding, faz upload de documentos, chama a RPC e compensa falhas |
| `getPendingDriverApplicationsUseCase` | `./use-cases/get-pending-driver-applications.use-case.ts` | Guard auth/org/permissao, lista pendentes e gera signed URLs |
| `reviewDriverApplicationUseCase` | `./use-cases/review-driver-application.use-case.ts` | Guard auth/org/permissao, carrega candidatura da org e aprova/rejeita com idempotencia |

---

## Steps locais

| Step | Caminho | Responsabilidade |
|---|---|---|
| `uploadDriverDocumentsStep` | `./slices/register-as-driver/steps/upload-driver-documents.step.ts` | Usa o service de upload para enviar CRLV/CNH e retornar os paths privados |
| `createDriverApplicationStep` | `./slices/register-as-driver/steps/create-driver-application.step.ts` | Usa o service da RPC para criar membership/candidatura a partir dos paths enviados |

---

## Services locais

| Service | Caminho | Responsabilidade |
|---|---|---|
| `uploadDriverDocumentsService` | `./services/upload-driver-documents.service.ts` | Valida CRLV/CNH, envia os dois arquivos para o bucket privado e remove arquivos ja enviados em falha parcial |
| `deleteDriverDocumentsService` | `./services/delete-driver-documents.service.ts` | Remove documentos privados em compensacoes apos upload |
| `createDriverDocumentSignedUrlService` | `./services/create-driver-document-signed-url.service.ts` | Gera signed URL de curta duracao para documento privado (`AppResultAsync`) |
| `createDriverDocumentSignedUrlsService` | `./services/create-driver-document-signed-urls.service.ts` | Gera signed URLs em lote (1 chamada) para varios documentos privados, best-effort por path (`AppResultAsync`) |
| `registerDriverApplicationService` | `./services/register-driver-application.service.ts` | Chama a RPC de cadastro de motorista e traduz `error_code` para `OperationResponse` |
| `listPendingDriverApplicationsService` | `./services/list-pending-driver-applications.service.ts` | Lista candidaturas pendentes da org com dados do candidato/veiculo (`AppResultAsync`) |
| `approveDriverApplicationService` | `./services/approve-driver-application.service.ts` | Chama a RPC `approve_driver_application` e traduz `not_found`, `already_reviewed` e `generic_error` |
| `rejectDriverApplicationService` | `./services/reject-driver-application.service.ts` | Atualiza status para `rejected` com guard de idempotencia (status pending) e mapeia falhas para `generic_error` |
| `getDriverApplicationByIdService` | `./services/get-driver-application-by-id.service.ts` | Carrega uma candidatura por id e traduz ausencia/erro de repo para code |

---

## Repos locais

| Repo | Caminho | Responsabilidade |
|---|---|---|
| `uploadDriverDocumentAdminRepo` | `./repos/upload-driver-document.admin.repo.ts` | Upload admin no bucket `fleet-documents` com path `fleet/{organizationId}/{userId}/{uuid}.{ext}` e `upsert:false` |
| `createSignedDocumentUrlAdminRepo` | `./repos/create-signed-document-url.admin.repo.ts` | Gera signed URL no bucket privado com TTL padrao de 300s |
| `createSignedDocumentUrlsAdminRepo` | `./repos/create-signed-document-urls.admin.repo.ts` | Gera signed URLs em lote (1 chamada `storage.createSignedUrls`) com TTL padrao de 300s |
| `deleteDriverDocumentAdminRepo` | `./repos/delete-driver-document.admin.repo.ts` | Remove um ou mais paths do bucket `fleet-documents` |
| `registerDriverApplicationAdminRepo` | `./repos/register-driver-application.admin.repo.ts` | Chama `register_driver_application` com admin client para membership + candidatura atomicas |
| `listPendingDriverApplicationsAdminRepo` | `./repos/list-pending-driver-applications.admin.repo.ts` | Le candidaturas pending da org com embed do candidato |
| `getDriverApplicationByIdAdminRepo` | `./repos/get-driver-application-by-id.admin.repo.ts` | Le id/org/status de uma candidatura (admin client, tabela bloqueada por RLS) para o guard de review |
| `approveDriverApplicationAdminRepo` | `./repos/approve-driver-application.admin.repo.ts` | Chama `approve_driver_application` com admin client (insere driver + status approved) |
| `rejectDriverApplicationAdminRepo` | `./repos/reject-driver-application.admin.repo.ts` | Atualiza status para `rejected` com filtro `status = pending` (admin client) |

---

## Dependencias externas ao modulo

### `lib`

| Import | Uso |
|---|---|
| `@/lib/supabase/admin` | Operacoes admin no Supabase Storage privado e chamada da RPC de cadastro |

### `shared`

| Import | Uso |
|---|---|
| `@/modules/accounts/onboarding/server/slices/register-and-join/steps/*` | Reuso de resolucao de org/ref, signup/signin, criacao de usuario publico e referral |
| `@/modules/auth/server/services/delete-auth-user.service` | Rollback de auth user quando usuario novo falha apos upload |
| `@/modules/auth/server/services/get-current-auth-user.service` | Guard de autenticacao dos use-cases de review |
| `@/modules/auth/server/services/has-membership-permission.service` | Guard de permissao `fleet.applications.manage` nos use-cases de review |
| `@/modules/emails/server/services/send-welcome-email.service` | Welcome email best-effort quando a RPC informa `joinedNow` |
| `@/modules/fleet/shared/constants/vehicle-types` | Tipo `VehicleType` aceito pela RPC de cadastro e pelo DTO de listagem |
| `@/modules/fleet/shared/types/inputs` | Contrato de entrada do use-case de signup como motorista |
| `@/modules/fleet/shared/validations/register-as-driver.schema` | Validacao server-side da action de signup como motorista |
| `@/modules/organizations/server/services/get-organization-by-id.service` | Nome da organizacao para welcome email best-effort |
| `@/modules/organizations/server/services/get-organization-id-by-app-domain.service` | Resolucao do tenant por host nos use-cases de review |
| `@/shared/http/get-request-host` | Host da request para resolver o tenant nos use-cases de review |
| `@/shared/types/operation-response.types` | Contrato de retorno dos services |
| `@/shared/types/supabase` | Tipos gerados para tabelas e RPCs do Supabase |

---

## Call Matrix

| Origem | Chama | Observacoes |
|---|---|---|
| `registerAndJoinAsDriverAction` | `registerAndJoinAsDriverUseCase` | Valida `FormData` e normaliza campos snake_case para camelCase |
| `registerAndJoinAsDriverUseCase` | steps de onboarding | Reusa org/ref, signup/signin, criacao de usuario publico e referral |
| `registerAndJoinAsDriverUseCase` | `uploadDriverDocumentsStep` | Upload dos documentos depois de garantir usuario |
| `registerAndJoinAsDriverUseCase` | `createDriverApplicationStep` | Cria membership/candidatura via RPC |
| `registerAndJoinAsDriverUseCase` | `deleteDriverDocumentsService` | Cleanup quando falha depois do upload |
| `registerAndJoinAsDriverUseCase` | `deleteAuthUserService` | Rollback quando usuario novo falha depois do upload |
| `registerAndJoinAsDriverUseCase` | `sendWelcomeEmailService` | Best-effort quando `joinedNow` |
| `uploadDriverDocumentsStep` | `uploadDriverDocumentsService` | Encapsula o upload de CRLV/CNH para o futuro use-case |
| `createDriverApplicationStep` | `registerDriverApplicationService` | Encapsula a chamada da RPC para o futuro use-case |
| `uploadDriverDocumentsService` | `uploadDriverDocumentAdminRepo` | Faz upload separado de CRLV e CNH |
| `deleteDriverDocumentsService` | `deleteDriverDocumentAdminRepo` | Remove documentos por path |
| `uploadDriverDocumentsService` | `deleteDriverDocumentAdminRepo` | Cleanup em falha parcial ou exception apos upload |
| `createDriverDocumentSignedUrlService` | `createSignedDocumentUrlAdminRepo` | Encapsula erro de Storage em `AppResultAsync` |
| `createDriverDocumentSignedUrlsService` | `createSignedDocumentUrlsAdminRepo` | Mapeia resultado em lote para `urlsByPath`, best-effort por path |
| `registerDriverApplicationService` | `registerDriverApplicationAdminRepo` | Mapeia `plate_taken`, `application_pending_exists` e `infra_error` |
| `getPendingDriverApplicationsAction` | `getPendingDriverApplicationsUseCase` | Traduz codigos internos para `OperationResponse` |
| `approveDriverApplicationAction` | `reviewDriverApplicationUseCase` | Chama com `action: "approve"` e `revalidatePath('/dashboard/config/fleet')` em sucesso |
| `rejectDriverApplicationAction` | `reviewDriverApplicationUseCase` | Chama com `action: "reject"` e `revalidatePath('/dashboard/config/fleet')` em sucesso |
| `getPendingDriverApplicationsUseCase` | `getCurrentAuthUserService` | Guard de autenticacao |
| `getPendingDriverApplicationsUseCase` | `getOrganizationIdByAppDomainService` | Resolve o tenant por host |
| `getPendingDriverApplicationsUseCase` | `hasMembershipPermissionService` | Exige `fleet.applications.manage` |
| `getPendingDriverApplicationsUseCase` | `listPendingDriverApplicationsService` | Lista candidaturas pendentes da org |
| `getPendingDriverApplicationsUseCase` | `createDriverDocumentSignedUrlsService` | Gera signed URLs CRLV/CNH em 1 chamada em lote (best-effort, null em falha) |
| `reviewDriverApplicationUseCase` | `getCurrentAuthUserService` | Guard de autenticacao |
| `reviewDriverApplicationUseCase` | `getOrganizationIdByAppDomainService` | Resolve o tenant por host |
| `reviewDriverApplicationUseCase` | `hasMembershipPermissionService` | Exige `fleet.applications.manage` |
| `reviewDriverApplicationUseCase` | `getDriverApplicationByIdService` | Carrega a candidatura para guard de escopo/idempotencia |
| `reviewDriverApplicationUseCase` | `approveDriverApplicationService` | Aprova via RPC quando `action === "approve"` |
| `reviewDriverApplicationUseCase` | `rejectDriverApplicationService` | Rejeita via update quando `action === "reject"` |
| `getDriverApplicationByIdService` | `getDriverApplicationByIdAdminRepo` | Mapeia ausencia para `not_found` e erro técnico para `generic_error` |
| `listPendingDriverApplicationsService` | `listPendingDriverApplicationsAdminRepo` | Mapeia erro para `generic_error` |
| `approveDriverApplicationService` | `approveDriverApplicationAdminRepo` | Mapeia `not_found`, `already_reviewed` e `infra_error` |
| `rejectDriverApplicationService` | `rejectDriverApplicationAdminRepo` | Sem linha afetada => `already_reviewed`; erro => `infra_error` |

---

## Fluxos

### Fluxo: Signup como motorista

1. Action extrai `FormData`, aceita nomes camelCase e snake_case para campos de veiculo, valida o schema server e monta DTO camelCase.
2. Use-case resolve organizacao por host e ref best-effort.
3. Reusa signup/signin e cria `public.users`/`user_profiles` somente para usuario novo.
4. Faz upload de CRLV/CNH no bucket privado.
5. Chama a RPC `register_driver_application` para membership + candidatura.
6. Em falha depois do upload, remove documentos; se usuario era novo, remove auth user.
7. Em sucesso, dispara welcome email e referral em best-effort quando `joinedNow`.

### Fluxo: Upload de documentos

1. Valida CRLV e CNH (PDF/JPG/PNG/WEBP, ate 10 MB cada).
2. Envia CRLV no bucket privado `fleet-documents`.
3. Envia CNH no mesmo bucket.
4. Se o segundo upload ou uma exception falhar apos upload parcial, remove os paths ja enviados.
5. Retorna `{ crlvPath, cnhPath }`.

### Fluxo: Signed URL

1. Recebe path privado persistido.
2. Gera signed URL com TTL padrao de 300s.
3. Retorna apenas a URL assinada.

### Fluxo: Registro de candidatura via RPC

1. Recebe organizacao, usuario, placa normalizada, tipo de veiculo, dados opcionais do veiculo e paths CRLV/CNH.
2. Chama `register_driver_application` com admin client.
3. Mapeia `plate_taken`, `application_pending_exists` e `infra_error` para `OperationResponse`.
4. Em sucesso, retorna `{ applicationId, joinedNow }`.

### Fluxo: Listagem de candidaturas pendentes

1. Use-case autentica (`unauthenticated`), resolve o tenant por host (`org_not_found`) e exige a permissao `fleet.applications.manage` (`not_allowed`). Falhas tecnicas retornam `generic_error`.
2. Lista candidaturas com status `pending` da org com dados do candidato/veiculo.
3. Gera signed URLs (TTL 300s) para todos os paths CRLV/CNH em uma unica chamada em lote, best-effort por path (null em falha, sem bloquear a lista).
4. Retorna um DTO camelCase sem paths crus dos documentos.

### Fluxo: Aprovar/Rejeitar candidatura

1. Use-case reusa o preludio auth -> org -> permissao da listagem.
2. Carrega a candidatura; inexistente ou de outra org => `not_found` (nao vaza existencia cross-org); status != `pending` => `already_reviewed`.
3. `approve`: RPC `approve_driver_application` insere em `drivers` e marca `approved` (retorna `driverId`).
4. `reject`: update com guard `status = pending`; **nao altera a membership** do usuario (permanece membro).
5. As actions chamam `revalidatePath('/dashboard/config/fleet')` em sucesso.

---

## Comportamentos importantes

### Storage privado

Todos os repos de documentos usam `createAdminClient()` e o bucket privado `fleet-documents`. Nao usar client SSR ou URL publica para CRLV/CNH.

### Cleanup

`uploadDriverDocumentsService` remove arquivos ja enviados quando ocorre falha parcial. Futuras etapas do signup tambem devem usar `deleteDriverDocumentAdminRepo` ou service equivalente para limpar arquivos se a RPC de candidatura falhar depois do upload.

### RPC de cadastro

`registerDriverApplicationService` nao acessa tabelas diretamente. Toda a consistencia de membership + `driver_application` depende da RPC `register_driver_application`, que deve retornar `application_id`, `joined_now` e `error_code`.

### Guard de permissao e escopo cross-org

Os use-cases de review sempre seguem auth -> resolucao de tenant por host -> `hasMembershipPermissionService('fleet.applications.manage')`. Candidatura inexistente e candidatura de outra org sao ambas tratadas como `not_found` para nao vazar existencia de recursos entre organizacoes.

### Idempotencia da revisao

Aprovar/rejeitar so atua sobre candidaturas com status `pending`. O `reject` usa `update ... .eq('status','pending')` e trata "nenhuma linha afetada" como `already_reviewed`, evitando race entre revisores. Rejeitar nao remove a membership do candidato.

---

## Nao usados / Atencao

| Item | Motivo | Recomendacao |
|---|---|---|
| — | — | Listagem, aprovacao e rejeicao de candidaturas usam o padrao flat |

---

## Notas de manutencao

Atualize este arquivo quando mudar bucket/path de documentos, TTL de signed URL, validacao de documentos, repos/services de Storage, fluxos de compensacao do signup, guards de permissao/escopo ou os entrypoints de listagem, aprovacao e rejeicao de candidaturas.

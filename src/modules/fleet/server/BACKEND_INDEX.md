# fleet/server

Indice da camada server-side de `fleet`.

Este arquivo serve como mapa rapido para entender entrypoints, arquivos principais, dependencias e fluxos backend deste modulo.

---

## Visao geral

Este modulo concentra o cadastro de motoristas, armazenamento privado de documentos de frota, candidaturas de motorista e revisao de candidaturas.

No estado atual, existe o backend do cadastro como motorista: action, use-case, steps, repos e services para Storage privado de documentos e registro via RPC transacional. Listagem e review serao adicionados em slices posteriores.

---

## Entrypoints

| Entrypoint | Caminho | Responsabilidade |
|---|---|---|
| `registerAndJoinAsDriverAction` | `./slices/register-as-driver/actions/register-and-join-as-driver.action.ts` | Valida `FormData` do signup de motorista e chama o use-case |

---

## Use-cases locais

| Use-case | Caminho | Responsabilidade |
|---|---|---|
| `registerAndJoinAsDriverUseCase` | `./slices/register-as-driver/use-cases/register-and-join-as-driver.use-case.ts` | Reusa steps de onboarding, faz upload de documentos, chama a RPC e compensa falhas |

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
| `createDriverDocumentSignedUrlService` | `./services/create-driver-document-signed-url.service.ts` | Gera signed URL de curta duracao para documento privado |
| `registerDriverApplicationService` | `./services/register-driver-application.service.ts` | Chama a RPC de cadastro de motorista e traduz `error_code` para `OperationResponse` |

---

## Repos locais

| Repo | Caminho | Responsabilidade |
|---|---|---|
| `uploadDriverDocumentAdminRepo` | `./repos/upload-driver-document.admin.repo.ts` | Upload admin no bucket `fleet-documents` com path `fleet/{organizationId}/{userId}/{uuid}.{ext}` e `upsert:false` |
| `createSignedDocumentUrlAdminRepo` | `./repos/create-signed-document-url.admin.repo.ts` | Gera signed URL no bucket privado com TTL padrao de 300s |
| `deleteDriverDocumentAdminRepo` | `./repos/delete-driver-document.admin.repo.ts` | Remove um ou mais paths do bucket `fleet-documents` |
| `registerDriverApplicationAdminRepo` | `./repos/register-driver-application.admin.repo.ts` | Chama `register_driver_application` com admin client para membership + candidatura atomicas |

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
| `@/modules/emails/server/services/send-welcome-email.service` | Welcome email best-effort quando a RPC informa `joinedNow` |
| `@/modules/fleet/shared/constants/vehicle-types` | Tipo `VehicleType` aceito pela RPC de cadastro |
| `@/modules/fleet/shared/types/inputs` | Contrato de entrada do use-case de signup como motorista |
| `@/modules/fleet/shared/validations/register-as-driver.schema` | Validacao server-side da action de signup como motorista |
| `@/modules/organizations/server/services/get-organization-by-id.service` | Nome da organizacao para welcome email best-effort |
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
| `createDriverDocumentSignedUrlService` | `createSignedDocumentUrlAdminRepo` | Encapsula erro de Storage em `OperationResponse` |
| `registerDriverApplicationService` | `registerDriverApplicationAdminRepo` | Mapeia `plate_taken`, `application_pending_exists` e `infra_error` |

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

---

## Comportamentos importantes

### Storage privado

Todos os repos de documentos usam `createAdminClient()` e o bucket privado `fleet-documents`. Nao usar client SSR ou URL publica para CRLV/CNH.

### Cleanup

`uploadDriverDocumentsService` remove arquivos ja enviados quando ocorre falha parcial. Futuras etapas do signup tambem devem usar `deleteDriverDocumentAdminRepo` ou service equivalente para limpar arquivos se a RPC de candidatura falhar depois do upload.

### RPC de cadastro

`registerDriverApplicationService` nao acessa tabelas diretamente. Toda a consistencia de membership + `driver_application` depende da RPC `register_driver_application`, que deve retornar `application_id`, `joined_now` e `error_code`.

---

## Nao usados / Atencao

| Item | Motivo | Recomendacao |
|---|---|---|
| Slices de `fleet` | Ainda nao existem | Atualizar este indice quando actions/use-cases/steps forem criados |

---

## Notas de manutencao

Atualize este arquivo quando mudar bucket/path de documentos, TTL de signed URL, validacao de documentos, repos/services de Storage ou fluxos de compensacao do modulo `fleet`.

# fleet/server

Índice da camada server-side de `fleet`.

## Visão geral

O módulo concentra o cadastro público de motoristas, candidaturas, documentos privados e revisão de candidaturas. Os fluxos novos usam entrypoints flat em `actions/` e `use-cases/`.

## Entrypoints

| Entrypoint | Caminho | Responsabilidade |
|---|---|---|
| `registerAndJoinAsDriverAction` | `./actions/register-and-join-as-driver.action.ts` | Valida um payload objeto e traduz os codes do cadastro público |
| `addDriverApplicationAction` | `./actions/add-driver-application.action.ts` | Adiciona candidatura para membro existente |
| `getPendingDriverApplicationsAction` | `./actions/get-pending-driver-applications.action.ts` | Lista candidaturas pendentes da organização |
| `getFleetDriversForTableAction` | `./actions/get-fleet-drivers-for-table.action.ts` | Prepara a listagem de motoristas ativos e inativos para a tabela de gestão da frota |
| `approveDriverApplicationAction` | `./actions/approve-driver-application.action.ts` | Aprova uma candidatura |
| `rejectDriverApplicationAction` | `./actions/reject-driver-application.action.ts` | Rejeita uma candidatura |

## Use-cases principais

| Use-case | Caminho | Responsabilidade |
|---|---|---|
| `registerAndJoinAsDriverUseCase` | `./use-cases/register-and-join-as-driver.use-case.ts` | Cria/autentica conta, garante membership e registra candidatura com compensação de documentos |
| `addDriverApplicationUseCase` | `./use-cases/add-driver-application.use-case.ts` | Valida membro, placa e candidatura antes de criar uma candidatura administrativa |
| `getPendingDriverApplicationsUseCase` | `./use-cases/get-pending-driver-applications.use-case.ts` | Protege e lista candidaturas pendentes com signed URLs |
| `getFleetDriversForTableUseCase` | `./use-cases/get-fleet-drivers-for-table.use-case.ts` | Autentica, resolve o tenant, autoriza e projeta os motoristas para a tabela |
| `reviewDriverApplicationUseCase` | `./use-cases/review-driver-application.use-case.ts` | Protege e aprova/rejeita candidaturas com idempotência |

## Services do fluxo de candidatura

| Service | Responsabilidade |
|---|---|
| `checkPlateAvailableService` | Impede placa ativa duplicada antes do upload |
| `checkPendingDriverApplicationService` | Impede candidatura pendente duplicada antes do upload |
| `uploadDriverDocumentService` | Envia um documento por chamada ao bucket privado |
| `deleteDriverDocumentsService` | Remove documentos em compensações do use-case |
| `createDriverApplicationService` | Insere uma candidatura `pending` em `driver_applications` |
| `createDriverDocumentSignedUrlsService` | Gera signed URLs em lote para documentos privados |
| `listPendingDriverApplicationsService` | Lista candidaturas pendentes com dados do candidato |
| `listFleetDriversByOrganizationIdService` | Lista motoristas ativos e inativos com membro e candidatura de origem |
| `approveDriverApplicationService` | Aprova via RPC `approve_driver_application` |
| `rejectDriverApplicationService` | Rejeita com guard de status `pending` |

## Fluxo: cadastro público de motorista

1. A Action valida diretamente o objeto recebido com `registerAsDriverSchemaServer`.
2. O use-case resolve organização e inviter, autentica ou cria a conta via trigger e estabelece sessão.
3. Garante membership `MEMBER` sem deslogar o usuário em falhas posteriores.
4. Executa os gates de placa e candidatura pendente antes do Storage.
5. Envia CRLV e CNH individualmente; falha parcial remove o CRLV já enviado.
6. Insere a candidatura com `createDriverApplicationService`; falha remove os dois documentos.
7. Welcome email e referral são best-effort.

## Regras importantes

- CRLV e CNH ficam no bucket privado `fleet-documents`; não expor paths como URLs públicas.
- A Action é a única camada que traduz codes internos em mensagens para o usuário.
- O use-case retorna `AppResultAsync` e não contém `MSG_*` ou apresentação.
- Os codes `plate_taken` e `pending_application_exists` vêm dos gates; falhas de insert retornam `generic_error`.
- Não há rollback manual de auth user. A criação de auth, `users` e `user_profiles` é atômica pela trigger.
- Aprovação/rejeição só atua sobre candidaturas `pending`; recursos cross-org são tratados como `not_found`.
- A tabela de motoristas exige `fleet.applications.manage` e sempre resolve `organizationId` pelo host da requisição.
- Na projeção da tabela, `member` e `approvedAt` são obrigatórios; ausência do usuário relacionado ou de `driver_applications.reviewed_at` é tratada como inconsistência pelo Service.
- `approvedAt` vem de `driver_applications.reviewed_at` e `isActive` vem de `drivers.is_active`.
- `listDriversWithMemberAndOriginApplicationByOrganizationIdAdminRepo` usa o admin client, mas restringe explicitamente a consulta ao tenant autorizado.

## Dependências compartilhadas relevantes

- `auth`: criação de conta trigger-based e sessão.
- `organizations/memberships`: membership e role `MEMBER`.
- `organizations/referrals`: referral best-effort.
- `emails`: welcome email best-effort.
- `shared/validations/slices/register-as-driver.schema`: contrato client/server do cadastro público.

Atualize este índice quando mudarem os entrypoints, o bucket de documentos, os gates ou a política de compensação.

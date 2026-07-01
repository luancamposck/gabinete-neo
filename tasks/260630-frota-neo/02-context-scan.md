# Backend Context Scan

## 1. Request Summary
Frota NEO adiciona um signup público de **motorista** em `/fleet/signup` que reaproveita o cadastro atual (`register-and-join`) + dados de veículo (placa, tipo, modelo/ano/cor) + documentos (CRLV, CNH em bucket privado). O usuário **entra imediatamente na organização** (membership normal, com suporte a `?ref=`) e gera uma **`driver_application` `pending`**. Um membro com **nova permission dedicada (em inglês)** aprova/rejeita — a aprovação decide apenas se a pessoa vira motorista, nunca o pertencimento à org. Decisões já tomadas no brief: atomicidade da parte de dados via **RPC transacional Postgres**; upload **após** criar o usuário; usuário já existente **só** gera candidatura; placa com **dono único**; código/tabelas/permission em inglês (módulo `fleet`).

## 2. Candidate Modules
| Módulo/Submódulo | Classificação | Motivo |
|---|---|---|
| `fleet` (novo) | `primary` | Dono da feature: signup de motorista, driver_application, aprovação, storage de docs |
| `accounts/onboarding` | `secondary` | Fluxo `register-and-join` a ser estendido/reaproveitado (signup + membership + ref) |
| `organizations/memberships` | `secondary` | Membership imediata, roles, permissões e RPCs de permissão para o aprovador |
| `auth` | `secondary` | `signUpService`, `deleteAuthUserService`, catálogo `PERMISSIONS`, RPCs de permissão |
| `accounts/users` + `accounts/users/profiles` | `secondary` | Criação de `public.users` + `user_profiles` para usuário novo |
| `organizations` (server raiz) | `reference` | Padrão de upload em Supabase Storage (OG image) e geração de URL |
| `organizations/referrals` | `reference` | Padrão best-effort de insert + `?ref=` já coberto pelo onboarding |
| `emails` | `reference` | Welcome email best-effort (reaproveitável; notificação de aprovação está fora do v1) |
| `organizations/tasks` | `unlikely` | Sem relação direta com frota |

## 3. Indexes Consulted
| Index | Status | Notes |
|---|---|---|
| root `BACKEND_INDEX.md` | ok | Mapa de módulos e dependências; não há módulo `fleet` ainda |
| `accounts/onboarding/server` | ok | Steps do register-and-join, rollback e best-effort documentados |
| `auth/server` | ok | Services de auth/admin e RPCs `has_membership_permission` / `list_membership_permissions` |
| `organizations/memberships/server` | ok | Membership, roles, permissões privilegiadas, sync de role_permissions |
| `organizations/referrals/server` | ok | Padrão de `?ref=` e insert best-effort |
| `accounts/users/server` + `profiles/server` | ok | Criação de user público/perfil e tratamento de `23505` |
| `emails/server` | ok | Welcome email best-effort |

## 4. Relevant Files
| File | Reason |
|---|---|
| `accounts/onboarding/server/slices/register-and-join/use-cases/register-and-join.use-case.ts` | Orquestração alvo da extensão; ponto de inserção da candidatura |
| `.../steps/ensure-membership.step.ts` | Membership imediata (role `MEMBER`) + `invited_by_user_id`; padrão de signOut em falha |
| `.../steps/create-public-user-and-profile.step.ts` | Rollback via `deleteAuthUserService` (limite atômico atual) |
| `.../steps/sign-up-or-sign-in.step.ts` | Modo `new`/`existing` + mensagem neutra (não vazar existência de email) |
| `accounts/onboarding/shared/validations/register-and-join.schema.ts` | Schema server/client a estender com campos de frota |
| `accounts/onboarding/shared/types/inputs.ts` | `RegisterAndJoinParams` a ampliar |
| `auth/shared/permissions.ts` | Catálogo `PERMISSIONS` — nova key de frota precisa ser registrada aqui |
| `auth/server/services/list-membership-permissions.service.ts` | **Filtra keys contra `PERMISSIONS`**: key não registrada é descartada silenciosamente |
| `auth/server/services/has-membership-permission.service.ts` | Checagem booleana de permissão (guard do aprovador) |
| `organizations/memberships/server/services/create-membership.service.ts` | Insert de membership (`MembershipInsert`) |
| `organizations/server/repos/upload-organization-og-image.admin.repo.ts` | Padrão de upload em Storage (admin, path único) — bucket é **público** |
| `organizations/server/repos/get-public-asset-url.repo.ts` | Usa `getPublicUrl`; **não** há `createSignedUrl` no código hoje |
| `supabase/migrations/20260203070320_init_core_rbac.sql` | Schema `roles`/`permissions`/`role_permissions` |
| `supabase/migrations/20260211113000_seed_permission_users_read.sql` | Padrão de seed de permission + grant a `OWNER`/`ADMIN` |
| `supabase/migrations/20260203091849_rpc_has_membership_permission.sql` | Padrão de RPC (SQL `stable`, read-only) |

## 5. Existing Patterns Found
- **Arquitetura em steps + use-case**: onboarding compõe steps que retornam `OperationResponse`; o use-case decide `return` em falha. Modelo direto para um `registerAndJoinAsDriverUseCase` ou um step novo `createDriverApplicationStep`.
- **Rollback manual de Auth**: `createPublicUserAndProfileStep` deleta o auth user se a criação de dados públicos falhar. É o único ponto com compensação hoje.
- **Best-effort não-bloqueante**: `ref`, welcome email e referral não quebram o cadastro (`recordReferralStep`, `sendWelcomeEmailService`).
- **Mensagem neutra / não vazar email**: `signUpOrSignInStep` retorna mensagem genérica quando email já existe.
- **RBAC por organização**: permissions globais em `permissions.key`, vinculadas por org via `role_permissions`; seed via migration com `on conflict do nothing` e grant a `OWNER`/`ADMIN`.
- **Guard de permissão**: use-cases sensíveis chamam `hasMembershipPermissionService(PERMISSIONS.X)` após `getCurrentAuthUserService` + resolver tenant por host.
- **Storage admin**: upload via `createAdminClient().storage.from(bucket).upload(path, file, {...})`, path único com `crypto.randomUUID()`, `upsert:false`.
- **Tratamento de unicidade**: erros Postgres `23505` são mapeados para mensagens específicas (username, telefone) — modelo para placa duplicada.
- **`?ref=`**: totalmente coberto por `resolveInviterByRefStep` + `recordReferralStep` ao reusar o fluxo.

## 6. Relevant Server-Side Dependencies
```txt
fleet (novo)
  -> accounts/onboarding      (reuso do register-and-join: signup + membership + ref)
  -> accounts/users           (create-user.service, get-user-id-by-username.service)
  -> accounts/users/profiles  (create-user-profile.service — só p/ usuário novo)
  -> auth                     (sign-up, delete-auth-user, has-membership-permission, PERMISSIONS)
  -> organizations            (get-organization-id-by-app-domain — tenant por host)
  -> organizations/memberships(create-membership, get-role-by-name, is-user-member-of-organization)
  -> lib/supabase/admin       (Storage privado + escrita admin de driver_applications)
  -> Supabase RPC (nova)      (transação: driver_application [+ membership] atômica)
  -> Supabase Storage (novo bucket privado p/ CRLV/CNH) + signed URLs
```

## 7. Critical Behaviors to Preserve
- **Rollback de Auth**: manter `deleteAuthUserService` quando o usuário for novo e algum passo essencial falhar; a candidatura de motorista precisa entrar na cadeia sem furar esse rollback.
- **Atomicidade real**: a decisão do brief (RPC transacional) só cobre operações de banco. Auth + upload de arquivo ficam **fora** da transação DB — definir a fronteira atômica e a compensação (deletar auth user / limpar arquivos) explicitamente.
- **Best-effort**: `ref`, welcome email e referral seguem não-bloqueantes.
- **Mensagem neutra**: não vazar se o email já existe no signup de frota.
- **Usuário existente não é sobrescrito**: mode `existing` não toca em `public.users`/`user_profiles`; alinhado à decisão "só cria a candidatura".
- **Registro de permission no catálogo**: nova key precisa existir em `auth/shared/permissions.ts`, senão `listMembershipPermissionsService` a descarta e a UI/guard do aprovador não a enxerga.
- **Membership imediata com role `MEMBER`** e `invited_by_user_id` continuam iguais.
- **Normalização snake_case → camelCase** na action e DTO específico (não retornar entidade crua).

## 8. Risks and Points of Attention
| Risk | Impact | Notes |
|---|---|---|
| ~~Estender `registerAndJoinUseCase` adiciona branching~~ (RESOLVIDO) | — | Decidido: novo `registerAndJoinAsDriverUseCase` reusando os steps; não incha o use-case atual |
| Fronteira de atomicidade (compensação fora da transação) | Alto | Decidido: RPC cobre membership + driver_application. **Ainda exige** compensação manual explícita para auth user novo e arquivos de Storage órfãos |
| Ordem upload × RPC | Médio | Decisão: upload após criar usuário; se a RPC falhar depois, limpar arquivos do Storage (implementar cleanup) |
| Nenhum bucket privado / signed URL no código | Médio | Só existe padrão de bucket **público** (`public-assets`) com `getPublicUrl`. Bucket privado + `createSignedUrl` + policies é padrão novo (PII: CRLV/CNH) |
| Nova permission não registrada no catálogo TS | Médio | `list-membership-permissions` filtra por `PERMISSIONS`; esquecer o registro quebra o guard/UI do aprovador silenciosamente |
| ~~Escopo da unicidade de placa~~ (RESOLVIDO) | — | Decidido: única por organização. Atenção à unique parcial p/ conviver com candidaturas `rejected` |
| RPC transacional é padrão novo | Médio | RPCs atuais são SQL `stable` read-only; a nova precisa ser `plpgsql`/`volatile`, provavelmente `security definer` — revisar permissões/segurança |
| ~~Representação do motorista aprovado~~ (RESOLVIDO) | — | Decidido: tabela `drivers` (não é role), membership intacta |
| Índices legados `README.md` em cada módulo | Baixo | Fonte de verdade é o código/`BACKEND_INDEX.md`; ignorar READMEs |

## 9. Decisões (resolvidas) e Gaps restantes

### Decisões tomadas
- **Fronteira atômica**: a RPC transacional cobre **membership + `driver_application`** numa única transação. Auth (`signUp`) e upload de docs ficam **fora**, com compensação manual (deletar auth user novo / limpar arquivos do Storage) em caso de falha.
- **Unicidade de placa**: **única por organização** (mesma placa não pode ter dois donos na mesma org; pode existir em orgs diferentes) — constraint com escopo `organization_id`.
- **Reenvio de candidatura**: `rejected` libera nova submissão; uma `pending` bloqueia nova; `approved` não candidata de novo.
- **Estrutura do fluxo**: novo `registerAndJoinAsDriverUseCase` no módulo `fleet` que **reusa os steps** do onboarding + step de candidatura (não incha o use-case atual; segue AGENTS).
- **Tipos de veículo**: **enum fixo** no código/DB (validado por Zod + constraint).
- **Grant da permission**: seed concede a **`OWNER` e `ADMIN`** (padrão dos seeds atuais).
- **Motorista aprovado**: **tabela `drivers`** (vinculada a user+org+veículo); **não** é role e não altera membership.
- **Campos obrigatórios da candidatura**: placa, tipo, CRLV e CNH **obrigatórios**; modelo/ano/cor **opcionais**.

### Gaps restantes (para PRD/Technical Plan)
- **Nomes exatos**: key da permission (inglês), nomes finais das tabelas (`driver_applications`, `drivers`), nome do bucket privado, valores do enum de tipo de veículo.
- **Assinatura da RPC**: parâmetros, retorno (ids criados / código de erro) e como o use-case consome; revisar `security definer`/`volatile`.
- **Constraint de placa vs reenvio**: a unicidade "por org" precisa conviver com histórico de candidaturas `rejected` (unique parcial só sobre candidatura ativa/`pending`+`approved` e/ou sobre a tabela `drivers`).

## 10. Recommended Next Step
**Product PRD** (`/prd`) do Frota NEO, consolidando as decisões do brief + os gaps da seção 9 (fronteira atômica, escopo da placa, política de reenvio, nomes de tabela/permission/bucket). Em seguida, **Technical Plan** detalhando: migrations (tabelas + RPC transacional + seed da permission), padrão de Storage privado com signed URLs, e a estratégia de extensão/reuso do `register-and-join`. Nenhuma alteração de código foi feita neste scan.

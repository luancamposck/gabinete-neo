# accounts/onboarding/server

Índice da camada server-side de `accounts/onboarding`.

Este arquivo serve como mapa rápido para entender entrypoints, arquivos principais, dependências e fluxos backend deste submódulo.

---

## Visao geral

Este submódulo orquestra cadastro inicial e entrada na organização atual. O fluxo resolve tenant por host, aceita referral de forma best-effort, cria ou autentica usuário no Supabase Auth, cria dados públicos para usuário novo, garante membership, envia e-mail de boas-vindas e registra referral quando aplicável.

---

## Entrypoints

| Entrypoint | Arquivo | Observações |
|---|---|---|
| `registerAndJoinAction` | `./slices/register-and-join/actions/register-and-join.action.ts` | Valida `registerAndJoinSchemaServer` e chama o use-case |

---

## Slices

| Slice | Caminho | Responsabilidade |
|---|---|---|
| `register-and-join` | `./slices/register-and-join/` | Cadastro, autenticação e entrada na organização atual |

---

## Actions

| Action | Caminho | Observações |
|---|---|---|
| `registerAndJoinAction` | `./slices/register-and-join/actions/register-and-join.action.ts` | Normaliza o formato de endereço vindo do schema server |

---

## Use-cases

| Use-case | Caminho | Observações |
|---|---|---|
| `registerAndJoinUseCase` | `./slices/register-and-join/use-cases/register-and-join.use-case.ts` | Orquestra steps, services externos, welcome email e referral best-effort |

---

## Steps

| Step | Caminho | Responsabilidade |
|---|---|---|
| `resolveOrganizationIdByHostStep` | `./slices/register-and-join/steps/resolve-organization-id-by-host.step.ts` | Resolver host e `organizationId` |
| `resolveInviterByRefStep` | `./slices/register-and-join/steps/resolve-inviter-by-ref.step.ts` | Resolver inviter por `ref` sem bloquear cadastro |
| `signUpOrSignInStep` | `./slices/register-and-join/steps/sign-up-or-sign-in.step.ts` | Criar usuário Auth ou autenticar usuário existente |
| `createPublicUserAndProfileStep` | `./slices/register-and-join/steps/create-public-user-and-profile.step.ts` | Criar `users` e `user_profiles` para usuário novo |
| `ensureMembershipStep` | `./slices/register-and-join/steps/ensure-membership.step.ts` | Garantir membership na organização atual |
| `recordReferralStep` | `./slices/register-and-join/steps/record-referral.step.ts` | Registrar referral de forma best-effort |

---

## Services locais

Nenhum service local.

---

## Repos locais

Nenhum repo local.

---

## Dependências externas ao módulo

### `accounts/users`

| Import | Uso |
|---|---|
| `@/modules/accounts/users/server/services/create-user.service` | Criar registro em `public.users` |
| `@/modules/accounts/users/server/services/get-user-id-by-username.service` | Resolver `ref` para `inviterUserId` |

### `accounts/users/profiles`

| Import | Uso |
|---|---|
| `@/modules/accounts/users/profiles/server/services/create-user-profile.service` | Criar `user_profiles` |

### `auth`

| Import | Uso |
|---|---|
| `@/modules/auth/server/services/sign-up.service` | Criar usuário no Supabase Auth |
| `@/modules/auth/server/services/sign-in.service` | Autenticar usuário existente quando e-mail já existe |
| `@/modules/auth/server/services/delete-auth-user.service` | Rollback se falhar criação de dados públicos |
| `@/modules/auth/server/services/sign-out.service` | Limpar sessão em falhas após sign-in de usuário existente |

### `emails`

| Import | Uso |
|---|---|
| `@/modules/emails/server/services/send-welcome-email.service` | Enviar boas-vindas best-effort após join |

### `organizations`

| Import | Uso |
|---|---|
| `@/modules/organizations/server/services/get-organization-id-by-app-domain.service` | Resolver tenant pelo host |
| `@/modules/organizations/server/services/get-organization-by-id.service` | Obter nome da organização para welcome email |

### `organizations/memberships`

| Import | Uso |
|---|---|
| `@/modules/organizations/memberships/server/services/is-user-member-of-organization.service` | Validar inviter e membership existente |
| `@/modules/organizations/memberships/server/services/get-role-by-name.service` | Buscar role `MEMBER` |
| `@/modules/organizations/memberships/server/services/create-membership.service` | Criar membership |

### `organizations/referrals`

| Import | Uso |
|---|---|
| `@/modules/organizations/referrals/server/services/create-referral.service` | Registrar referral quando houve join novo |

### `shared`

| Import | Uso |
|---|---|
| `@/shared/http/get-request-host` | Resolver domínio atual |
| `@/shared/types/operation-response.types` | Contrato de retorno |

---

## Call Matrix

| Origem | Chama | Observações |
|---|---|---|
| `registerAndJoinAction` | `registerAndJoinUseCase` | Após validar schema server |
| `registerAndJoinUseCase` | `resolveOrganizationIdByHostStep` | Falha se host/org não resolver |
| `registerAndJoinUseCase` | `resolveInviterByRefStep` | Sempre best-effort |
| `registerAndJoinUseCase` | `signUpOrSignInStep` | Retorna `mode: "new" | "existing"` |
| `registerAndJoinUseCase` | `createPublicUserAndProfileStep` | Somente quando `mode === "new"` |
| `registerAndJoinUseCase` | `ensureMembershipStep` | Garante membership e retorna `joinedNow` |
| `registerAndJoinUseCase` | `sendWelcomeEmailService` | Best-effort quando `joinedNow` |
| `registerAndJoinUseCase` | `recordReferralStep` | Best-effort |

---

## Fluxos

### Fluxo: Register and Join

1. `registerAndJoinAction` valida dados de cadastro e endereço.
2. `resolveOrganizationIdByHostStep` resolve host e `organizationId`.
3. `resolveInviterByRefStep` tenta resolver `ref`; falhas não bloqueiam.
4. `signUpOrSignInStep` tenta sign-up; se `email_exists`, tenta sign-in com mensagem neutra em falha.
5. Se usuário é novo, `createPublicUserAndProfileStep` cria `public.users` e `user_profiles`.
6. `ensureMembershipStep` cria membership `MEMBER` ou detecta membership existente.
7. Se entrou agora, busca nome da organização e envia welcome email best-effort.
8. `recordReferralStep` registra referral se ref válida e join novo; falhas não bloqueiam.
9. Retorna `organizationId` e `userId`.

---

## Comportamentos importantes

### Rollback

`createPublicUserAndProfileStep` chama `deleteAuthUserService` se a criação de `public.users` ou `user_profiles` falhar após criar usuário no Auth.

### Best-effort

Resolver `ref`, enviar welcome email e registrar referral não bloqueiam o cadastro quando falham.

### Usuário existente

Quando o e-mail já existe, `signUpOrSignInStep` tenta `signInService`; falha retorna mensagem neutra para não vazar informação sensível.

### Sessão

Se usuário existente autentica e falhas técnicas ocorrem ao garantir membership, `ensureMembershipStep` tenta `signOutService`.

---

## Não usados / Atenção

| Item | Motivo | Recomendacao |
|---|---|---|
| `src/modules/accounts/onboarding/server/README.md` | Índice legado; não reflete todos os steps e comportamentos atuais | Manter apenas como legado temporário ou migrar/remover em tarefa própria |

---

## Notas de manutencao

Atualize este arquivo quando mudar cadastro, rollback, sign-up/sign-in de usuário existente, membership default, welcome email, referral ou shape do schema `registerAndJoinSchemaServer`.

# organizations/referrals/server

Índice da camada server-side de `organizations/referrals`.

Este arquivo serve como mapa rápido para entender entrypoints, arquivos principais, dependências e fluxos backend deste submódulo.

---

## Visao geral

Este submódulo concentra indicações/referrals da organização: geração do link pessoal, registro de referral via onboarding e listagem de referrals para tabelas administrativas.

---

## Entrypoints

| Entrypoint | Arquivo | Observações |
|---|---|---|
| `getMyReferralLinkAction` | `./slices/get-my-referral-link/actions/get-my-referral-link.action.ts` | Gera URL com `?ref={username}` |
| `getOrganizationReferralsForTableAction` | `./slices/get-organization-referrals-for-table/actions/get-organization-referrals-for-table.action.ts` | Lista referrals da organização para tabela |
| `createOrganizationReferralService` | `./services/create-referral.service.ts` | Service consumido pelo onboarding em modo best-effort |

---

## Slices

| Slice | Caminho | Responsabilidade |
|---|---|---|
| `get-my-referral-link` | `./slices/get-my-referral-link/` | Gerar link de referral do usuário autenticado |
| `get-organization-referrals-for-table` | `./slices/get-organization-referrals-for-table/` | Listar referrals com dados de inviter/invited |

---

## Actions

| Action | Caminho | Observações |
|---|---|---|
| `getMyReferralLinkAction` | `./slices/get-my-referral-link/actions/get-my-referral-link.action.ts` | Chama o use-case diretamente |
| `getOrganizationReferralsForTableAction` | `./slices/get-organization-referrals-for-table/actions/get-organization-referrals-for-table.action.ts` | Normaliza rows para `OrganizationReferralTableRow` |

---

## Use-cases

| Use-case | Caminho | Observações |
|---|---|---|
| `getMyReferralLinkUseCase` | `./slices/get-my-referral-link/use-cases/get-my-referral-link.use-case.ts` | Exige usuário autenticado e membership |
| `getOrganizationReferralsForTableUseCase` | `./slices/get-organization-referrals-for-table/use-cases/get-organization-referrals-for-table.use-case.ts` | Exige usuário autenticado e membership |

---

## Services locais

| Service | Caminho | Responsabilidade |
|---|---|---|
| `createOrganizationReferralService` | `./services/create-referral.service.ts` | Insere referral em `organization_referrals` |
| `listReferralsWithInviterByOrganizationIdService` | `./services/list-referrals-with-inviter-by-organization-id.service.ts` | Lista referrals com nomes/emails de inviter e invited |

---

## Repos locais

| Repo | Caminho | Responsabilidade |
|---|---|---|
| `insertOrganizationReferralAdminRepo` | `./repos/insert-referral.admin.repo.ts` | Insere referral via Supabase Admin |
| `listReferralsWithInviterByOrganizationIdAdminRepo` | `./repos/list-referrals-with-inviter-by-organization-id.admin.repo.ts` | Lista referrals por organização com joins de usuários |

---

## Dependências externas ao módulo

### `accounts/users`

| Import | Uso |
|---|---|
| `@/modules/accounts/users/server/services/get-username-by-user-id.service` | Obter username para montar URL de referral |

### `auth`

| Import | Uso |
|---|---|
| `@/modules/auth/server/services/get-current-auth-user.service` | Resolver usuário autenticado |

### `organizations`

| Import | Uso |
|---|---|
| `@/modules/organizations/server/services/get-organization-id-by-app-domain.service` | Resolver tenant pelo host |

### `organizations/memberships`

| Import | Uso |
|---|---|
| `@/modules/organizations/memberships/server/services/is-user-member-of-organization.service` | Validar membership antes de gerar/listar referrals |

### `shared`

| Import | Uso |
|---|---|
| `@/shared/http/get-request-host` | Obter host atual |
| `@/shared/types/operation-response.types` | Contrato de retorno |

### `lib`

| Import | Uso |
|---|---|
| `@/lib/supabase/admin` | Inserção/listagem admin de referrals |

---

## Call Matrix

| Origem | Chama | Observações |
|---|---|---|
| `getMyReferralLinkAction` | `getMyReferralLinkUseCase` | Entry point de link pessoal |
| `getMyReferralLinkUseCase` | `getOrganizationIdByAppDomainService` | Resolve tenant |
| `getMyReferralLinkUseCase` | `getCurrentAuthUserService` | Resolve usuário |
| `getMyReferralLinkUseCase` | `isUserMemberOfOrganizationService` | Bloqueia não membros |
| `getMyReferralLinkUseCase` | `getUsernameByUserIdService` | Monta `referralUrl` |
| `getOrganizationReferralsForTableAction` | `getOrganizationReferralsForTableUseCase` | Entry point de tabela |
| `getOrganizationReferralsForTableUseCase` | `listReferralsWithInviterByOrganizationIdService` | Lista referrals da org |
| `createOrganizationReferralService` | `insertOrganizationReferralAdminRepo` | Usado por `accounts/onboarding` |

---

## Fluxos

### Fluxo: Get My Referral Link

1. Resolve host atual.
2. Resolve `organizationId` pelo `app_domain`.
3. Obtém usuário autenticado.
4. Confirma membership na organização.
5. Busca username por `userId`.
6. Retorna URL `http://localhost:3000/?ref={username}` em development ou `https://{host}/?ref={username}` fora de development.

### Fluxo: Organization Referrals Table

1. Autentica usuário.
2. Resolve host e organização.
3. Confirma membership.
4. Lista referrals com dados de inviter e invited.
5. Action converte para DTO de tabela.

### Fluxo: Create Referral

1. `createOrganizationReferralService` recebe organização, inviter, invited e relacionamento opcional.
2. `insertOrganizationReferralAdminRepo` insere em `organization_referrals`.
3. Retorna `referralId`.

---

## Comportamentos importantes

### Best-effort externo

O registro de referral e chamado pelo onboarding via `recordReferralStep`, que trata falhas como best-effort; este service local em si retorna falha normalmente.

### Ambientes

`getMyReferralLinkUseCase` usa URL localhost em `NODE_ENV=development` e host real fora disso.

### Membership

Gerar link e listar tabela exigem que o usuário seja membro da organização atual.

---

## Não usados / Atenção

| Item | Motivo | Recomendacao |
|---|---|---|
| `src/modules/organizations/referrals/server/README.md` | Índice legado; não lista a action/use-case de tabela nem service de listagem | Manter apenas como legado temporário ou migrar/remover em tarefa própria |

---

## Notas de manutencao

Atualize este arquivo quando mudar formato de referral, regra de URL, listagem com inviter/invited, dependência com onboarding ou regras de membership.

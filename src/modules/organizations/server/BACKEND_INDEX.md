# organizations/server

Índice da camada server-side de `organizations`.

Este arquivo serve como mapa rápido para entender entrypoints, arquivos principais, dependências e fluxos backend deste módulo.

---

## Visao geral

Este módulo concentra resolução da organização atual por domínio, leitura de organização, atualização de dados administrativos e upload/remoção de imagem Open Graph em storage público.

---

## Entrypoints

| Entrypoint | Arquivo | Observações |
|---|---|---|
| `getOrganizationIdByAppDomainAction` | `./slices/get-organization-id-by-app-domain/actions/get-organization-id-by-app-domain.action.ts` | Lookup direto por `appDomain` |
| `getCurrentOrganizationAction` | `./slices/get-current-organization/actions/get-current-organization.action.ts` | Carrega organização atual e resolve URL pública da imagem |
| `getOrganizationAdminSettingsAction` | `./slices/get-organization-admin-settings/actions/get-organization-admin-settings.action.ts` | Carrega settings admin com permissão `org.admin.read` |
| `updateCurrentOrganizationAction` | `./slices/update-current-organization/actions/update-current-organization.action.ts` | Valida payload e atualiza nome/descrição |
| `uploadOrganizationOgImageAction` | `./slices/upload-organization-og-image/actions/upload-organization-og-image.action.ts` | Valida FormData, faz upload e retorna URL pública best-effort |
| `deleteOrganizationOgImageAction` | `./slices/delete-organization-og-image/actions/delete-organization-og-image.action.ts` | Remove imagem atual e limpa `image_path` |

---

## Slices

| Slice | Caminho | Responsabilidade |
|---|---|---|
| `get-organization-id-by-app-domain` | `./slices/get-organization-id-by-app-domain/` | Resolver organização por domínio |
| `get-current-organization` | `./slices/get-current-organization/` | Dados públicos da organização atual |
| `get-organization-admin-settings` | `./slices/get-organization-admin-settings/` | Dados administrativos da organização |
| `update-current-organization` | `./slices/update-current-organization/` | Atualizar campos editáveis da organização atual |
| `upload-organization-og-image` | `./slices/upload-organization-og-image/` | Upload e persistência de imagem OG |
| `delete-organization-og-image` | `./slices/delete-organization-og-image/` | Remoção da imagem OG atual |

---

## Actions

| Action | Caminho | Observações |
|---|---|---|
| `getOrganizationIdByAppDomainAction` | `./slices/get-organization-id-by-app-domain/actions/get-organization-id-by-app-domain.action.ts` | Chama service direto |
| `getCurrentOrganizationAction` | `./slices/get-current-organization/actions/get-current-organization.action.ts` | Converte `OrganizationView` para DTO e resolve image URL |
| `getOrganizationAdminSettingsAction` | `./slices/get-organization-admin-settings/actions/get-organization-admin-settings.action.ts` | Converte organization para DTO |
| `updateCurrentOrganizationAction` | `./slices/update-current-organization/actions/update-current-organization.action.ts` | Valida `editOrganizationActionSchema` |
| `uploadOrganizationOgImageAction` | `./slices/upload-organization-og-image/actions/upload-organization-og-image.action.ts` | Valida `uploadOrganizationOgImageSchema` e resolve URL pública best-effort |
| `deleteOrganizationOgImageAction` | `./slices/delete-organization-og-image/actions/delete-organization-og-image.action.ts` | Chama use-case diretamente |

---

## Use-cases

| Use-case | Caminho | Observações |
|---|---|---|
| `getCurrentOrganizationUseCase` | `./slices/get-current-organization/use-cases/get-current-organization.use-case.ts` | Resolve tenant pelo host e busca organização |
| `getOrganizationAdminSettingsUseCase` | `./slices/get-organization-admin-settings/use-cases/get-organization-admin-settings.use-case.ts` | Exige auth e permissão `org.admin.read` |
| `updateCurrentOrganizationUseCase` | `./slices/update-current-organization/use-cases/update-current-organization.use-case.ts` | Exige auth e permissão `org.admin.update` |
| `uploadOrganizationOgImageUseCase` | `./slices/upload-organization-og-image/use-cases/upload-organization-og-image.use-case.ts` | Exige permissão, uploada imagem, atualiza path e remove imagem antiga best-effort |
| `deleteOrganizationOgImageUseCase` | `./slices/delete-organization-og-image/use-cases/delete-organization-og-image.use-case.ts` | Exige permissão, remove storage e limpa `image_path` |

---

## Services locais

| Service | Caminho | Responsabilidade |
|---|---|---|
| `getOrganizationIdByAppDomainService` | `./services/get-organization-id-by-app-domain.service.ts` | Buscar `organizationId` por `app_domain` |
| `getOrganizationByIdService` | `./services/get-organization-by-id.service.ts` | Buscar organização por id |
| `getOrganizationWithMemberhipService` | `./services/get-organization-with-membership.service.ts` | Buscar organização com membership de usuário |
| `updateOrganizationService` | `./services/update-organization.service.ts` | Atualizar campos de organização |
| `getOrganizationImagePathService` | `./services/get-organization-image-path.service.ts` | Buscar `image_path` atual |
| `uploadOrganizationOgImageService` | `./services/upload-organization-og-image.service.ts` | Validar arquivo e fazer upload no storage |
| `deleteOrganizationOgImageService` | `./services/delete-organization-og-image.service.ts` | Remover imagem do storage |
| `getPublicAssetUrlService` | `./services/get-public-asset-url.service.ts` | Resolver URL pública de asset |

---

## Repos locais

| Repo | Caminho | Responsabilidade |
|---|---|---|
| `findOrganizationIdByAppDomainAdminRepo` | `./repos/find-organization-id-by-app-domain.admin.repo.ts` | Buscar id por app domain |
| `findOrganizationByIdAdminRepo` | `./repos/find-organization-by-id.admin.repo.ts` | Buscar organização por id |
| `findOrganizationWithMemberhipRepo` | `./repos/find-organization-with-membership.repo.ts` | Buscar organização com membership usando SSR client |
| `updateOrganizationRepo` | `./repos/update-organization.repo.ts` | Atualizar `organizations` |
| `findOrganizationImagePathRepo` | `./repos/find-organization-image-path.repo.ts` | Buscar `image_path` |
| `uploadOrganizationOgImageAdminRepo` | `./repos/upload-organization-og-image.admin.repo.ts` | Upload em bucket `public-assets` |
| `deleteOrganizationOgImageAdminRepo` | `./repos/delete-organization-og-image.admin.repo.ts` | Remover arquivo do bucket |
| `getPublicAssetUrlRepo` | `./repos/get-public-asset-url.repo.ts` | Resolver URL pública no bucket |

---

## Dependências externas ao módulo

### `auth`

| Import | Uso |
|---|---|
| `@/modules/auth/server/services/get-current-auth-user.service` | Autenticação de fluxos admin |
| `@/modules/auth/server/services/has-membership-permission.service` | Permissões `org.admin.read` e `org.admin.update` |

### `shared`

| Import | Uso |
|---|---|
| `@/shared/http/get-request-host` | Resolver tenant pelo host |
| `@/shared/infra/next/rethrow-if-next-error` | Preservar erros especiais do Next em services |
| `@/shared/types/operation-response.types` | Contrato de retorno |

### `lib`

| Import | Uso |
|---|---|
| `@/lib/supabase/admin` | Lookups admin e storage admin |
| `@/lib/supabase/server` | Updates SSR, public URL e joins com membership |

---

## Call Matrix

| Origem | Chama | Observações |
|---|---|---|
| `getCurrentOrganizationAction` | `getCurrentOrganizationUseCase` | Depois resolve `imageUrl` |
| `getCurrentOrganizationUseCase` | `getOrganizationIdByAppDomainService` | Resolve tenant |
| `getCurrentOrganizationUseCase` | `getOrganizationByIdService` | Busca organização |
| `getOrganizationAdminSettingsUseCase` | `hasMembershipPermissionService` | Exige `org.admin.read` |
| `updateCurrentOrganizationUseCase` | `hasMembershipPermissionService` | Exige `org.admin.update` |
| `updateCurrentOrganizationUseCase` | `updateOrganizationService` | Atualiza nome/descrição |
| `uploadOrganizationOgImageUseCase` | `uploadOrganizationOgImageService` | Upload storage |
| `uploadOrganizationOgImageUseCase` | `updateOrganizationService` | Persiste novo `image_path` |
| `uploadOrganizationOgImageUseCase` | `deleteOrganizationOgImageService` | Remove imagem antiga best-effort |
| `deleteOrganizationOgImageUseCase` | `deleteOrganizationOgImageService` | Remove storage |
| `deleteOrganizationOgImageUseCase` | `updateOrganizationService` | Limpa `image_path` |

---

## Fluxos

### Fluxo: Current Organization

1. Resolve host e `organizationId`.
2. Busca organização por id.
3. Action resolve URL pública se existir `imagePath`.
4. Retorna DTO da organização.

### Fluxo: Update Organization

1. Action valida payload e normaliza descrição vazia para `null`.
2. Use-case autentica usuário.
3. Resolve tenant pelo host.
4. Verifica permissão `org.admin.update`.
5. Atualiza `name` e `description`.

### Fluxo: Upload OG Image

1. Action valida `FormData` com schema de upload.
2. Use-case autentica, resolve tenant e verifica `org.admin.update`.
3. Busca `image_path` antigo.
4. Valida arquivo (JPG/PNG/WEBP até 2 MB) e faz upload com path único.
5. Atualiza `image_path`.
6. Remove imagem antiga se existia.
7. Action tenta resolver URL pública.

### Fluxo: Delete OG Image

1. Autentica, resolve tenant e verifica permissão.
2. Busca `image_path` atual.
3. Se não houver imagem, retorna `deleted: false`.
4. Remove arquivo do bucket e limpa `image_path`.

---

## Comportamentos importantes

### Storage público

Uploads e deletes usam bucket `public-assets`. Upload usa path com `crypto.randomUUID()` para evitar cache de OG.

### Best-effort

No upload, remover a imagem antiga não bloqueia o sucesso. A action também trata falha ao resolver URL pública como não bloqueante.

### Permissões admin

Settings usam `org.admin.read`; updates/upload/delete usam `org.admin.update`.

---

## Não usados / Atenção

| Item | Motivo | Recomendacao |
|---|---|---|
| `src/modules/organizations/server/README.md` | Índice legado; não cobre settings, update e fluxos de OG image atuais | Manter apenas como legado temporário ou migrar/remover em tarefa própria |
| Prefix log de `get-current-organization.use-case.ts` | Usa string `[getOrganizationAdminSettingsUseCase]:`, possivelmente copy/paste | Revisar em tarefa própria se logs precisarem de precisão |

---

## Notas de manutencao

Atualize este arquivo quando mudar resolução por app domain, permissões admin, campos editáveis da organização, storage bucket, validação de imagem ou DTOs de organização.

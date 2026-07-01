# fleet/server

Indice da camada server-side de `fleet`.

Este arquivo serve como mapa rapido para entender entrypoints, arquivos principais, dependencias e fluxos backend deste modulo.

---

## Visao geral

Este modulo concentra o cadastro de motoristas, armazenamento privado de documentos de frota, candidaturas de motorista e revisao de candidaturas.

No estado atual, existem apenas os repos e services de Storage privado para documentos. Os fluxos de signup, listagem e review serao adicionados em slices posteriores.

---

## Entrypoints

Nenhum entrypoint publico foi criado ainda.

---

## Services locais

| Service | Caminho | Responsabilidade |
|---|---|---|
| `uploadDriverDocumentsService` | `./services/upload-driver-documents.service.ts` | Valida CRLV/CNH, envia os dois arquivos para o bucket privado e remove arquivos ja enviados em falha parcial |
| `createDriverDocumentSignedUrlService` | `./services/create-driver-document-signed-url.service.ts` | Gera signed URL de curta duracao para documento privado |

---

## Repos locais

| Repo | Caminho | Responsabilidade |
|---|---|---|
| `uploadDriverDocumentAdminRepo` | `./repos/upload-driver-document.admin.repo.ts` | Upload admin no bucket `fleet-documents` com path `fleet/{organizationId}/{userId}/{uuid}.{ext}` e `upsert:false` |
| `createSignedDocumentUrlAdminRepo` | `./repos/create-signed-document-url.admin.repo.ts` | Gera signed URL no bucket privado com TTL padrao de 300s |
| `deleteDriverDocumentAdminRepo` | `./repos/delete-driver-document.admin.repo.ts` | Remove um ou mais paths do bucket `fleet-documents` |

---

## Dependencias externas ao modulo

### `lib`

| Import | Uso |
|---|---|
| `@/lib/supabase/admin` | Operacoes admin no Supabase Storage privado |

### `shared`

| Import | Uso |
|---|---|
| `@/shared/types/operation-response.types` | Contrato de retorno dos services |

---

## Call Matrix

| Origem | Chama | Observacoes |
|---|---|---|
| `uploadDriverDocumentsService` | `uploadDriverDocumentAdminRepo` | Faz upload separado de CRLV e CNH |
| `uploadDriverDocumentsService` | `deleteDriverDocumentAdminRepo` | Cleanup em falha parcial ou exception apos upload |
| `createDriverDocumentSignedUrlService` | `createSignedDocumentUrlAdminRepo` | Encapsula erro de Storage em `OperationResponse` |

---

## Fluxos

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

---

## Comportamentos importantes

### Storage privado

Todos os repos de documentos usam `createAdminClient()` e o bucket privado `fleet-documents`. Nao usar client SSR ou URL publica para CRLV/CNH.

### Cleanup

`uploadDriverDocumentsService` remove arquivos ja enviados quando ocorre falha parcial. Futuras etapas do signup tambem devem usar `deleteDriverDocumentAdminRepo` ou service equivalente para limpar arquivos se a RPC de candidatura falhar depois do upload.

---

## Nao usados / Atencao

| Item | Motivo | Recomendacao |
|---|---|---|
| Slices de `fleet` | Ainda nao existem | Atualizar este indice quando actions/use-cases/steps forem criados |

---

## Notas de manutencao

Atualize este arquivo quando mudar bucket/path de documentos, TTL de signed URL, validacao de documentos, repos/services de Storage ou fluxos de compensacao do modulo `fleet`.

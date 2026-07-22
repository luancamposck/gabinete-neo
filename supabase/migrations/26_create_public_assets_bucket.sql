-- =====================================================================
-- Migration: create_public_assets_bucket
-- Objetivo:
--   - Criar o bucket público 'public-assets' em storage.buckets para
--     armazenar arquivos que precisam ser lidos publicamente sem auth
--     (ex.: imagem OG das organizações).
--   - Restringir escrita (insert/update/delete) apenas ao service role
--     (backend via admin client); leitura liberada para qualquer role.
--
-- Premissas:
--   - Uploads/remoções são feitos apenas via client admin
--     (src/modules/organizations/server/repos/upload-organization-og-image.admin.repo.ts
--     e delete-organization-og-image.admin.repo.ts).
--   - Leitura é feita via getPublicUrl (bucket público, sem signed URL).
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1) Cria o bucket público (idempotente).
--
-- Notas:
--   - public = true permite servir os arquivos via URL pública estável,
--     sem necessidade de signed URL.
--   - file_size_limit e allowed_mime_types são um teto de segurança no
--     próprio Storage; a validação principal (2 MB, mesmos mime types)
--     já acontece em upload-organization-og-image.schema.ts.
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'public-assets',
  'public-assets',
  true,
  5242880, -- 5 MiB
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;


-- ---------------------------------------------------------------------
-- 2) Policies de storage.objects para o bucket 'public-assets'.
--
-- Notas:
--   - Leitura liberada para qualquer role (bucket é público por design).
--   - Escrita (insert/update/delete) restrita ao service role: nenhum
--     fluxo do app hoje escreve nesse bucket fora do client admin.
--   - Recriamos as policies de forma idempotente (drop if exists).
-- ---------------------------------------------------------------------
drop policy if exists "public_assets_public_select" on storage.objects;

create policy "public_assets_public_select"
  on storage.objects
  for select
  to public
  using (bucket_id = 'public-assets');

drop policy if exists "public_assets_service_role_insert" on storage.objects;

create policy "public_assets_service_role_insert"
  on storage.objects
  for insert
  to service_role
  with check (bucket_id = 'public-assets');

drop policy if exists "public_assets_service_role_update" on storage.objects;

create policy "public_assets_service_role_update"
  on storage.objects
  for update
  to service_role
  using (bucket_id = 'public-assets')
  with check (bucket_id = 'public-assets');

drop policy if exists "public_assets_service_role_delete" on storage.objects;

create policy "public_assets_service_role_delete"
  on storage.objects
  for delete
  to service_role
  using (bucket_id = 'public-assets');

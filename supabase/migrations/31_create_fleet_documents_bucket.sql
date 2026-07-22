-- =====================================================================
-- Migration: create_fleet_documents_bucket
-- Objetivo:
--   - Criar o bucket privado 'fleet-documents' para armazenar CRLV e
--     CNH enviados nas candidaturas de motorista.
--   - Restringir leitura e escrita ao service role, usado pelo backend
--     para uploads, remoções e geração de signed URLs.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1) Cria ou atualiza o bucket privado de documentos.
--
-- Os limites reproduzem a validação de upload da aplicação: até 10 MiB
-- por arquivo e somente PDF, JPEG, PNG ou WEBP.
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'fleet-documents',
  'fleet-documents',
  false,
  10485760, -- 10 MiB
  array['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;


-- ---------------------------------------------------------------------
-- 2) Policies de storage.objects.
--
-- Não há acesso direto de anon/authenticated. O service role ignora RLS
-- por padrão, e estas policies registram explicitamente a permissão
-- necessária para as operações administrativas do backend.
-- ---------------------------------------------------------------------
drop policy if exists "fleet_documents_service_role_select" on storage.objects;

create policy "fleet_documents_service_role_select"
  on storage.objects
  for select
  to service_role
  using (bucket_id = 'fleet-documents');

drop policy if exists "fleet_documents_service_role_insert" on storage.objects;

create policy "fleet_documents_service_role_insert"
  on storage.objects
  for insert
  to service_role
  with check (bucket_id = 'fleet-documents');

drop policy if exists "fleet_documents_service_role_update" on storage.objects;

create policy "fleet_documents_service_role_update"
  on storage.objects
  for update
  to service_role
  using (bucket_id = 'fleet-documents')
  with check (bucket_id = 'fleet-documents');

drop policy if exists "fleet_documents_service_role_delete" on storage.objects;

create policy "fleet_documents_service_role_delete"
  on storage.objects
  for delete
  to service_role
  using (bucket_id = 'fleet-documents');

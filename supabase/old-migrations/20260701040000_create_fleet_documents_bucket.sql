-- =====================================================================
-- Migration: create_fleet_documents_bucket
-- Objetivo:
--   - Criar o bucket privado 'fleet-documents' em storage.buckets para
--     armazenar documentos sensíveis dos motoristas (CRLV e CNH).
--   - Restringir leitura/escrita apenas ao service role (backend via
--     admin client), sem qualquer acesso anon/public/authenticated.
--
-- Premissas:
--   - Documentos são acessados no app somente via signed URLs geradas no
--     backend (admin client), com TTL curto.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1) Cria o bucket privado (idempotente).
--
-- Notas:
--   - public = false garante que arquivos não são servidos por URL
--     pública; o acesso é feito por signed URL gerada no backend.
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('fleet-documents', 'fleet-documents', false)
on conflict (id) do nothing;


-- ---------------------------------------------------------------------
-- 2) Policies de storage.objects para o bucket 'fleet-documents'.
--
-- Notas:
--   - O service role ignora RLS por padrão, mas as policies abaixo
--     tornam a intenção explícita: nenhum acesso anon/authenticated ao
--     bucket, apenas service role.
--   - Recriamos as policies de forma idempotente (drop if exists).
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

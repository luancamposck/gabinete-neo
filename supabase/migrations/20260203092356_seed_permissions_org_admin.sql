-- =====================================================================
-- Migration: seed_permissions_org_admin
-- Objetivo:
--   - Inserir (se não existir) as permissões:
--       - org.admin.read
--       - org.admin.update
--
-- Premissas:
--   - Tabela public.permissions já existe com:
--       id (uuid), key (unique), description (text not null)
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1) org.admin.read
-- ---------------------------------------------------------------------
insert into public.permissions (key, description)
values ('org.admin.read', 'Permite ler dados/configurações administrativas da organização.')
on conflict (key) do nothing;


-- ---------------------------------------------------------------------
-- 2) org.admin.update
-- ---------------------------------------------------------------------
insert into public.permissions (key, description)
values ('org.admin.update', 'Permite atualizar dados/configurações administrativas da organização.')
on conflict (key) do nothing;

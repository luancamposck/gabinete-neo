-- =====================================================================
-- Migration: create_permissions
-- Objetivo:
--   - Criar o catálogo global de permissões do sistema.
--   - Popular as permissions conhecidas pelo código.
--
-- Premissas:
--   - Permissions são controladas exclusivamente por migrations.
--   - Usuários não criam, editam ou desativam permissions.
--   - A coluna key é o contrato estável usado no código.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1) Table: public.permissions
-- ---------------------------------------------------------------------
create table public.permissions (
  -- Chave estável usada pelo código para checagem de autorização
  key text not null,

  -- Descrição administrativa da permissão
  description text not null,

  -- Data/hora de criação do registro
  created_at timestamptz not null default now(),

  -- A key é o identificador canônico da permissão
  constraint permissions_pkey primary key (key),

  -- Mantém o formato usado no código: recurso.ação
  constraint permissions_key_format_check
    check (key ~ '^[a-z0-9_]+(\.[a-z0-9_]+)+$'),

  -- Evita descrição vazia
  constraint permissions_description_check
    check (char_length(trim(description)) between 2 and 300)
) tablespace pg_default;


comment on table public.permissions is
  'Catálogo global de permissões disponíveis no sistema.';

comment on column public.permissions.key is
  'Chave estável usada pelo código para validar permissões.';

comment on column public.permissions.description is
  'Descrição administrativa da permissão.';

comment on column public.permissions.created_at is
  'Timestamp de criação do registro.';


-- ---------------------------------------------------------------------
-- 2) Seed: system permissions
-- ---------------------------------------------------------------------
insert into public.permissions (
  key,
  description
)
values
  (
    'org.admin.read',
    'Permite visualizar dados administrativos da organização.'
  ),
  (
    'org.admin.update',
    'Permite atualizar dados administrativos da organização.'
  ),
  (
    'users.read',
    'Permite visualizar usuários e perfis dentro da organização.'
  ),
  (
    'roles.read',
    'Permite visualizar roles e permissões da organização.'
  ),
  (
    'roles.update',
    'Permite criar, editar ou configurar roles customizadas.'
  ),
  (
    'org.membership.role.update',
    'Permite alterar a role de membros comuns da organização.'
  ),
  (
    'org.membership.role.update.privileged',
    'Permite alterar roles de membros privilegiados.'
  ),
  (
    'org.membership.status.update',
    'Permite ativar, desativar ou alterar status de membros comuns.'
  ),
  (
    'org.membership.status.update.privileged',
    'Permite ativar, desativar ou alterar status de membros privilegiados.'
  ),
  (
    'fleet.applications.manage',
    'Permite gerenciar candidaturas de motoristas/frota.'
  );

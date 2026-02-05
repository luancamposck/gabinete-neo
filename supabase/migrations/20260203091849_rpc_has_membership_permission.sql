-- =====================================================================
-- Migration: rpc_has_membership_permission
-- Objetivo:
--   - Criar (ou atualizar) a RPC:
--       public.has_membership_permission(...)
--   - Versão compatível com a migration que trocou:
--       organization_memberships.role (text) -> organization_memberships.role_id (uuid FK)
--
-- Premissas:
--   - public.organization_memberships existe e possui:
--       organization_id (uuid)
--       user_id (uuid)
--       role_id (uuid)   <-- NOVO (FK roles.id)
--       is_active (boolean)
--   - public.roles existe e possui:
--       id (uuid)
--       is_active (boolean)
--   - public.role_permissions existe e possui:
--       role_id (uuid)
--       permission_id (uuid)
--   - public.permissions existe e possui:
--       id (uuid)
--       key (text unique)
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1) Cria ou substitui a função RPC
-- ---------------------------------------------------------------------
create or replace function public.has_membership_permission(
  -- Parâmetro 1: ID da organização na qual vamos checar a permissão
  p_organization_id uuid,

  -- Parâmetro 2: ID do usuário que estamos validando
  p_user_id uuid,

  -- Parâmetro 3: chave única da permissão (ex.: 'tasks.read')
  p_permission_key text
) returns boolean
-- A função é escrita em SQL puro (sem PL/pgSQL)
language sql

-- "stable" indica que a função não modifica dados e, dentro de uma mesma
-- query, o resultado é consistente (bom para performance/planejamento)
stable
as $$
  -- Retornamos o resultado de um SELECT que produz TRUE/FALSE
  select exists (

    -- exists(...) retorna TRUE se esta subquery retornar ao menos 1 linha
    select 1

    -- Começamos pela tabela de memberships (vínculo usuário x organização)
    from public.organization_memberships om

    -- Ligamos a membership ao role atribuído
    join public.roles r
      -- role do membership precisa bater com o role.id
      -- (AGORA usamos om.role_id ao invés de om.role texto)
      on r.id = om.role_id

     -- e o role precisa estar ativo
     and r.is_active = true

    -- Ligamos o role às permissões através da tabela de junção role_permissions
    join public.role_permissions rp
      on rp.role_id = r.id

    -- Ligamos a junção à tabela de permissions
    join public.permissions p
      on p.id = rp.permission_id

     -- e filtramos pela chave da permissão desejada (ex.: 'tasks.read')
     and p.key = p_permission_key

    -- Agora aplicamos os filtros de escopo (organization, user) e estado da membership
    where om.organization_id = p_organization_id
      and om.user_id = p_user_id
      and om.is_active = true
  );
$$;


-- ---------------------------------------------------------------------
-- 2) Comentário (documentação) da RPC
-- ---------------------------------------------------------------------
comment on function public.has_membership_permission(uuid, uuid, text) is
  'Retorna true se o usuário tiver membership ativa na organização com role ativo (via role_id) contendo a permissão (permission.key).';

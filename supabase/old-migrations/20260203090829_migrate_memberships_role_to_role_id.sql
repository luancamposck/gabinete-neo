-- =====================================================================
-- Migration: migrate_memberships_role_to_role_id
-- Objetivo:
--   - Migrar public.organization_memberships.role (text) para role_id (uuid)
--     como FK para public.roles(id), sem perder os dados existentes.
--
-- Estratégia de migração dos dados (com fallback seguro):
--   1) Tenta mapear pelo nome atual do role (om.role) dentro da mesma organização
--        roles.organization_id = om.organization_id AND roles.name = om.role
--   2) Se não achar, faz fallback para o role "MEMBER" da mesma organização
--
-- Premissas:
--   - public.roles e public.organizations já existem
--   - public.roles possui: id (uuid), organization_id (uuid), name (text), is_active (boolean)
--   - public.organization_memberships possui: organization_id, user_id e a coluna role (text) atual
-- =====================================================================


-- ---------------------------------------------------------------------
-- 0) Extensão para UUID default (caso precise inserir roles faltantes)
-- ---------------------------------------------------------------------
create extension if not exists "pgcrypto" with schema extensions;


-- ---------------------------------------------------------------------
-- 1) Garantir que existe o role "MEMBER" em toda organization
--    (necessário para o fallback da migração)
-- ---------------------------------------------------------------------
insert into public.roles (organization_id, name, is_system, is_active)
select o.id, 'MEMBER', true, true
from public.organizations o
where not exists (
  select 1
  from public.roles r
  where r.organization_id = o.id
    and r.name = 'MEMBER'
);


-- ---------------------------------------------------------------------
-- 2) Adicionar nova coluna role_id (ainda permitindo NULL temporariamente)
-- ---------------------------------------------------------------------
alter table public.organization_memberships
add column role_id uuid null;

comment on column public.organization_memberships.role_id is
  'FK para public.roles.id (role atribuído ao membership).';


-- ---------------------------------------------------------------------
-- 3) Migrar dados existentes tentando mapear pelo nome atual do role (om.role)
--    Ex.: 'OWNER' -> role.id onde roles.name = 'OWNER' na mesma organization
-- ---------------------------------------------------------------------
update public.organization_memberships om
set role_id = r.id
from public.roles r
where r.organization_id = om.organization_id
  and r.name = om.role
  and r.is_active = true;


-- ---------------------------------------------------------------------
-- 4) Fallback: se por algum motivo não encontrou o role pelo nome,
--    então seta o role_id para o role "MEMBER" daquela organization
-- ---------------------------------------------------------------------
update public.organization_memberships om
set role_id = r_member.id
from public.roles r_member
where r_member.organization_id = om.organization_id
  and r_member.name = 'MEMBER'
  and om.role_id is null;


-- ---------------------------------------------------------------------
-- 5) Validação defensiva: não permitir seguir se ainda existir role_id NULL
-- ---------------------------------------------------------------------
do $$
begin
  if exists (
    select 1
    from public.organization_memberships
    where role_id is null
  ) then
    raise exception
      'Falha ao migrar organization_memberships.role -> role_id: existem registros sem role_id. Verifique se há roles por organization.';
  end if;
end;
$$;


-- ---------------------------------------------------------------------
-- 6) Agora que os dados foram migrados, tornar role_id obrigatório
-- ---------------------------------------------------------------------
alter table public.organization_memberships
alter column role_id set not null;


-- ---------------------------------------------------------------------
-- 7) Remover a constraint antiga (CHECK) e remover a coluna role (text)
-- ---------------------------------------------------------------------
alter table public.organization_memberships
drop constraint if exists organization_memberships_role_check;

alter table public.organization_memberships
drop column role;


-- ---------------------------------------------------------------------
-- 8) Criar a FK: organization_memberships.role_id -> roles.id
-- ---------------------------------------------------------------------
alter table public.organization_memberships
add constraint organization_memberships_role_id_fkey
  foreign key (role_id)
  references public.roles (id)
  on delete restrict;


-- ---------------------------------------------------------------------
-- 9) Index para acelerar joins/filtros por role_id
-- ---------------------------------------------------------------------
create index if not exists organization_memberships_role_id_idx
on public.organization_memberships using btree (role_id) tablespace pg_default;

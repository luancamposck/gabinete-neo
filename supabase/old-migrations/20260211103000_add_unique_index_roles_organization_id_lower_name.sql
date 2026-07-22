-- =====================================================================
-- Migration: add_unique_index_roles_organization_id_lower_name
-- Objetivo:
--   - Garantir unicidade case-insensitive de nome de cargo por organização
--     em public.roles, via índice:
--       unique (organization_id, lower(name))
--
-- Observação:
--   - A migration falha explicitamente se já existirem duplicidades
--     case-insensitive, evitando aplicar o índice em cenário inconsistente.
-- =====================================================================


do $$
declare
  v_duplicate record;
begin
  select
    r.organization_id,
    lower(r.name) as normalized_name,
    count(*) as duplicated_count,
    string_agg(r.name, ', ' order by r.name) as duplicated_names
  into v_duplicate
  from public.roles r
  group by r.organization_id, lower(r.name)
  having count(*) > 1
  limit 1;

  if v_duplicate is not null then
    raise exception using message = format(
      'Não foi possível criar índice único case-insensitive em public.roles: organization_id=%s, normalized_name=%s, total=%s, names=[%s].',
      v_duplicate.organization_id,
      v_duplicate.normalized_name,
      v_duplicate.duplicated_count,
      v_duplicate.duplicated_names
    );
  end if;
end $$;

create unique index if not exists roles_organization_id_lower_name_unique_idx
on public.roles using btree (organization_id, lower(name));

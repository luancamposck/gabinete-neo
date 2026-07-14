# Database and RLS
Este documento define as regras de Supabase, database, migrations, RLS e naming SQL do projeto.

## Clientes Supabase

Os clientes oficiais ficam em:

```txt
src/lib/supabase/admin.ts
src/lib/supabase/middleware.ts
src/lib/supabase/server.ts
```

- `server.ts` e `middleware.ts` usam `createServerClient` para SSR/middleware.
- `admin.ts` usa `createClient` com `SUPABASE_SERVICE_ROLE_KEY`.
- Nunca usar `supabaseAdmin` em código client.
- Repos que precisam do admin client devem ser separados em `*.admin.repo.ts`.
- Preferir o cliente SSR para operações do usuário autenticado.
- Manter queries tipadas com `Database` de `src/shared/types/supabase`.

## Migrations

Ao criar ou alterar tabelas, tratar como parte do mesmo ciclo:

- schema
- constraints
- indexes
- RLS
- policies
- triggers necessários
- types gerados

Regras:

- RLS é obrigatória para tabelas novas multi-tenant.
- Não criar tabela nova multi-tenant sem definir como ela será protegida por RLS.
- Toda tabela multi-tenant deve ter `organization_id`, salvo exceção explicitamente documentada na migration.
- Tabelas com `updated_at` devem usar o trigger compartilhado `public.handle_updated_at()`.
- FKs importantes devem ter indexes compatíveis com os filtros esperados.
- Depois de mudança de schema, gerar tipos com `npm run db:gen-types`.

Exemplo de estrutura esperada:

```sql
create table public.example_records (
  id uuid not null default gen_random_uuid(),
  organization_id uuid not null,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint example_records_pkey primary key (id),
  constraint example_records_organization_id_fkey
    foreign key (organization_id)
    references public.organizations (id)
    on delete cascade
);

create index example_records_organization_id_idx
  on public.example_records (organization_id);

create trigger on_example_records_updated
before update on public.example_records
for each row
execute function public.handle_updated_at();
```

## RLS

RLS faz parte da modelagem da tabela.

- Habilitar RLS na migration que cria ou protege a tabela.
- Se policies dependem de tabelas futuras, documentar a premissa e criar migration posterior para as policies.
- Policies devem ser explícitas por operação quando houver regras diferentes de leitura/escrita.
- Quando um fluxo usa apenas `service_role`, deixar isso explícito na migration ou no comentário da policy.
- Storage privado deve ter policies próprias em `storage.objects`.

Exemplo mínimo:

```sql
alter table public.example_records enable row level security;
```

Exemplo de policy:

```sql
create policy example_records_by_membership_select
  on public.example_records
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.memberships om
      where om.organization_id = example_records.organization_id
        and om.user_id = auth.uid()
        and om.is_active = true
    )
  );
```

## RPCs, functions e storage

- RPCs que executam operações privilegiadas devem revogar acesso de `public`, `anon` e `authenticated` quando forem exclusivas de `service_role`.
- RPCs devem receber ids explícitos, como `p_organization_id` e `p_user_id`, e validar escopo dentro da função.
- Buckets privados devem ser criados com `public = false`.
- Paths de storage devem incluir escopo suficiente para evitar colisão entre tenants, normalmente `organizationId/userId/...`.

Exemplo de permissão para RPC admin:

```sql
revoke execute on function public.example_admin_rpc(uuid) from public;
revoke execute on function public.example_admin_rpc(uuid) from anon;
revoke execute on function public.example_admin_rpc(uuid) from authenticated;
grant execute on function public.example_admin_rpc(uuid) to service_role;
```

## Naming SQL

Use nomes previsíveis e alinhados ao padrão das migrations existentes.

### Migrations

- Arquivos gerados pelo Supabase devem manter o prefixo timestamp.
- O nome depois do timestamp deve descrever a alteração em snake_case.
- Exemplos:
  - `20260701005134_create_fleet_driver_applications_and_drivers.sql`
  - `20260701030000_rpc_approve_driver_application.sql`
  - `20260211103000_add_unique_index_roles_organization_id_lower_name.sql`

### Tabelas e colunas

- Tabelas e colunas em `snake_case`.
- Tabelas de domínio geralmente no plural: `organizations`, `roles`, `driver_applications`.
- FK de tenant deve ser `organization_id`.
- FKs de usuário devem ser `user_id` ou nomes específicos como `reviewed_by_user_id`.

### Constraints e indexes

- Primary key: `<table>_pkey`.
- Foreign key: `<table>_<column>_fkey`.
- Check constraint: `<table>_<field>_check`.
- Unique constraint/index: incluir as colunas e o sufixo `_key`, `_idx` ou `_uidx`.
- Index comum: `<table>_<columns>_idx`.
- Unique index parcial: `<table>_<meaning>_uidx`.

Exemplos:

```sql
constraint drivers_organization_id_fkey
constraint driver_applications_status_check
create index drivers_organization_id_is_active_idx
create unique index driver_applications_org_plate_active_uidx
```

### Policies

- Nomear policies com `<table>_<scope>_<operation>`.
- Usar operações explícitas: `select`, `insert`, `update`, `delete`.
- O escopo deve explicar a regra principal: `own`, `by_membership`, `service_role`.

Exemplos:

```sql
users_own_select
user_profiles_own_update
example_records_by_membership_select
fleet_documents_service_role_select
```

### Triggers e functions

- Trigger de `updated_at`: `on_<table>_updated`.
- Trigger de criação: `on_<entity>_created`.
- Functions/RPCs em `snake_case`.
- Parâmetros de functions/RPCs devem usar prefixo `p_`.

Exemplos:

```sql
on_organization_tasks_updated
on_auth_user_created
register_driver_application(p_organization_id uuid, p_user_id uuid)
```

### Storage

- Buckets em kebab-case.
- Policies de storage devem incluir o bucket e a operação.

Exemplos:

```sql
fleet-documents
public-assets
fleet_documents_service_role_insert
```

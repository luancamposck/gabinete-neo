# Backend Index

Mapa da camada backend do repositório.

Este arquivo aponta para os índices backend locais e ajuda a localizar rapidamente módulos/submódulos com código server-side.

---

## Visão geral

O backend está organizado em módulos dentro de:

```txt
src/modules/**/server
```

Use este arquivo como ponto de partida para localizar o índice local do módulo que será lido ou alterado.

---

## Módulos com backend

| Módulo/Submódulo | Server path | Índice | Status | Observações |
|---|---|---|---|---|
| `accounts` | `src/modules/accounts/server` | `src/modules/accounts/server/BACKEND_INDEX.md` | `ok` | Dados agregados da conta atual |
| `accounts/onboarding` | `src/modules/accounts/onboarding/server` | `src/modules/accounts/onboarding/server/BACKEND_INDEX.md` | `ok` | Cadastro inicial e entrada em organização |
| `accounts/users` | `src/modules/accounts/users/server` | `src/modules/accounts/users/server/BACKEND_INDEX.md` | `ok` | Usuários públicos e username |
| `accounts/users/profiles` | `src/modules/accounts/users/profiles/server` | `src/modules/accounts/users/profiles/server/BACKEND_INDEX.md` | `ok` | Perfis, telefone e endereço de usuários |
| `app-shell` | `src/modules/app-shell/server` | `src/modules/app-shell/server/BACKEND_INDEX.md` | `ok` | Contexto server-side da sidebar/app shell |
| `auth` | `src/modules/auth/server` | `src/modules/auth/server/BACKEND_INDEX.md` | `ok` | Auth, sessão, guard e permissões |
| `emails` | `src/modules/emails/server` | `src/modules/emails/server/BACKEND_INDEX.md` | `ok` | Envio de e-mails via Resend |
| `fleet` | `src/modules/fleet/server` | `src/modules/fleet/server/BACKEND_INDEX.md` | `ok` | Documentos privados, candidaturas e motoristas |
| `organizations` | `src/modules/organizations/server` | `src/modules/organizations/server/BACKEND_INDEX.md` | `ok` | Organização atual, settings e imagem OG |
| `organizations/insights/people-map` | `src/modules/organizations/insights/people-map/server` | `src/modules/organizations/insights/people-map/server/BACKEND_INDEX.md` | `ok` | Pins e métricas do mapa de pessoas |
| `organizations/memberships` | `src/modules/organizations/memberships/server` | `src/modules/organizations/memberships/server/BACKEND_INDEX.md` | `ok` | Memberships, roles e permissões |
| `organizations/referrals` | `src/modules/organizations/referrals/server` | `src/modules/organizations/referrals/server/BACKEND_INDEX.md` | `ok` | Links e registros de referrals |
| `organizations/tasks` | `src/modules/organizations/tasks/server` | `src/modules/organizations/tasks/server/BACKEND_INDEX.md` | `ok` | Tarefas e assignments da organização |

---

## Dependências entre módulos

Registre apenas dependências backend relevantes.

```txt
accounts
  -> accounts/users
  -> auth
  -> organizations
  -> shared/http

accounts/onboarding
  -> accounts/users
  -> accounts/users/profiles
  -> auth
  -> emails
  -> organizations
  -> organizations/memberships
  -> organizations/referrals
  -> shared/http

accounts/users
  -> auth

accounts/users/profiles
  -> auth

app-shell
  -> accounts/users
  -> auth
  -> organizations
  -> shared/http

auth
  -> accounts/onboarding/shared
  -> organizations
  -> organizations/memberships
  -> shared/http
  -> Supabase RPC: has_membership_permission
  -> Supabase RPC: list_membership_permissions

emails
  -> lib/resend
  -> emails/shared

fleet
  -> lib/supabase/admin
  -> Supabase Storage: fleet-documents

organizations
  -> auth
  -> shared/http
  -> Supabase Storage: public-assets

organizations/insights/people-map
  -> auth
  -> organizations
  -> shared/http

organizations/memberships
  -> auth
  -> emails
  -> organizations
  -> organizations/referrals
  -> shared/http

organizations/referrals
  -> accounts/users
  -> auth
  -> organizations
  -> organizations/memberships
  -> shared/http

organizations/tasks
  -> auth
  -> organizations
  -> organizations/memberships
  -> shared/http
```

---

## Índices ausentes, legados ou atenção

| Path | Situação | Ação recomendada |
|---|---|---|
| `src/modules/accounts/onboarding/server/README.md` | legado | Migrar/remover em tarefa própria; `BACKEND_INDEX.md` já foi criado |
| `src/modules/accounts/users/server/README.md` | legado | Migrar/remover em tarefa própria; `BACKEND_INDEX.md` já foi criado |
| `src/modules/accounts/users/profiles/server/README.md` | legado | Migrar/remover em tarefa própria; `BACKEND_INDEX.md` já foi criado |
| `src/modules/auth/server/README.md` | legado | Migrar/remover em tarefa própria; `BACKEND_INDEX.md` já foi criado |
| `src/modules/organizations/server/README.md` | legado | Migrar/remover em tarefa própria; `BACKEND_INDEX.md` já foi criado |
| `src/modules/organizations/memberships/server/README.md` | legado | Migrar/remover em tarefa própria; `BACKEND_INDEX.md` já foi criado |
| `src/modules/organizations/referrals/server/README.md` | legado | Migrar/remover em tarefa própria; `BACKEND_INDEX.md` já foi criado |

---

## Notas de manutenção

Atualize este arquivo quando:

* um novo diretório `src/modules/**/server` for criado;
* um diretório `src/modules/**/server` for removido;
* um índice local for criado;
* um índice local for removido;
* um índice local for migrado de `README.md` para `BACKEND_INDEX.md`;
* uma dependência backend importante entre módulos mudar.

# emails/server

Índice da camada server-side de `emails`.

Este arquivo serve como mapa rápido para entender entrypoints, arquivos principais, dependências e fluxos backend deste módulo.

---

## Visao geral

Este módulo encapsula envio de e-mail via Resend, atualmente com suporte ao e-mail de boas-vindas usado por onboarding e join de organização.

---

## Entrypoints

| Entrypoint | Arquivo | Observações |
|---|---|---|
| `sendWelcomeEmailService` | `./services/send-welcome-email.service.ts` | Service consumido por fluxos de cadastro/join |

---

## Slices

Nenhum slice local.

---

## Actions

Nenhuma action local.

---

## Use-cases

Nenhum use-case local.

---

## Services locais

| Service | Caminho | Responsabilidade |
|---|---|---|
| `sendWelcomeEmailService` | `./services/send-welcome-email.service.ts` | Validar e-mail, montar template React e chamar repo Resend |

---

## Repos locais

| Repo | Caminho | Responsabilidade |
|---|---|---|
| `sendWelcomeEmailRepo` | `./repos/send-welcome-email.repo.ts` | Enviar e-mail usando `resendClient` |

---

## Dependências externas ao módulo

### `emails/shared`

| Import | Uso |
|---|---|
| `@/modules/emails/shared/templates/welcome-email.template` | Template React do e-mail |
| `@/modules/emails/shared/validations/send-welcome-email.schema` | Validação do destinatário |

### `shared`

| Import | Uso |
|---|---|
| `@/shared/infra/next/rethrow-if-next-error` | Não engolir erros especiais do Next |
| `@/shared/types/operation-response.types` | Contrato de retorno |

### `lib`

| Import | Uso |
|---|---|
| `@/lib/resend/resend-client` | Cliente Resend |

---

## Call Matrix

| Origem | Chama | Observações |
|---|---|---|
| `sendWelcomeEmailService` | `sendWelcomeEmailSchema.safeParse` | Valida destinatário normalizado |
| `sendWelcomeEmailService` | `WelcomeEmailTemplate` | Monta ReactNode com greeting/title/dashboardUrl |
| `sendWelcomeEmailService` | `sendWelcomeEmailRepo` | Envia via Resend |
| `sendWelcomeEmailRepo` | `resendClient.emails.send` | Usa `RESEND_FROM_EMAIL` ou fallback |

---

## Fluxos

### Fluxo: Send Welcome Email

1. Normaliza e valida `to`.
2. Monta greeting, title, subject e dashboardUrl opcional.
3. Renderiza `WelcomeEmailTemplate`.
4. `sendWelcomeEmailRepo` envia via Resend.
5. Retorna `emailId`.

---

## Comportamentos importantes

### Infra/SDK externo

Falhas do Resend retornam `infra_error`. Consumers como onboarding tratam envio como best-effort.

### Env var

`sendWelcomeEmailRepo` usa `process.env.RESEND_FROM_EMAIL` ou fallback `Gabinete Neo <onboarding@resend.dev>`.

---

## Não usados / Atenção

Nenhum item identificado.

---

## Notas de manutencao

Atualize este arquivo quando adicionar novos templates/repos de e-mail, mudar Resend ou alterar o contrato do welcome email.

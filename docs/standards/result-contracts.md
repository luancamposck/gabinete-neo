# Result Contracts

Define os tipos de retorno usados entre as camadas do backend e onde cada um deve ser usado.

## Tipos

Definidos em `src/shared/types/`.

### `AppResult<T, E>` / `AppResultAsync<T, E>`

Resultado interno da aplicação. Usado por Service e Use-case.

```ts
// src/shared/types/app-result.types.ts
export type AppResult<T, E extends string = string> =
	| { success: true; data: T }
	| { success: false; code: E }

export type AppResultAsync<T, E extends string = string> = Promise<AppResult<T, E>>
```

### `OperationResponse<T, E>`

Resposta pública para UI/API. Usado por Action, Route Handler e Presenter.

```ts
// src/shared/types/operation-response.types.ts
export type OperationResponse<T, E extends string = string> = Promise<
	| { success: true; message: string; data: T }
	| { success: false; message: string; code?: E }
>
```

## Quem retorna o quê

| Camada        | Tipo de retorno                                        | Tem `message`? | Tem `MSG_*`? |
| ------------- | ------------------------------------------------------ | -------------: | ------------: |
| Repo          | Resultado do Supabase (não tipado como `AppResult`)     |            Não |           Não |
| Service       | `AppResultAsync<T, E>`                                  |            Não |           Não |
| Use-case      | `AppResultAsync<T, E>`                                  |            Não |           Não |
| Action        | `OperationResponse<T, E>`                               |            Sim |           Sim |
| Route Handler | `OperationResponse<T, E>` ou resposta HTTP equivalente  |            Sim |           Sim |
| Presenter     | `OperationResponse<T, E>` ou DTO público                |            Sim |           Sim |

## Regras

- `code` é contrato interno estável — representa o motivo da falha, nunca a mensagem.
- `message` é apresentação para usuário — só existe na borda pública.
- `MSG_*` deve ficar na borda pública do fluxo (Action, Route Handler, Presenter).
- Services, Use-cases e Repos não devem declarar `MSG_*`.
- Services e Use-cases não devem retornar `message`.
- Actions devem traduzir `code` interno para `message`.
- Tipos globais devem ficar em `src/shared/types/`.

## Exemplo

Service (retorna `AppResultAsync`, sem `message`):

```ts
return {
	success: false,
	code: "email_exists",
}
```

Action (traduz `code` para `message` usando `MSG_*`):

```ts
const MESSAGE_BY_CODE = {
	email_exists: MSG_EMAIL_EXISTS,
	infra_error: MSG_INFRA_ERROR,
} satisfies Record<ErrorCodes, string>

if (result.success === false) {
	return { success: false, code: result.code, message: MESSAGE_BY_CODE[result.code] }
}
```

Exemplo real seguindo o contrato: `src/modules/auth/server/services/create-user.service.ts` e `src/modules/auth/server/use-cases/create-user.use-case.ts`.

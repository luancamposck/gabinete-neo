# AGENTS.md

## 📂 Estrutura de ações (Server Actions)

- Todas as actions dentro de **`/src/actions`** devem ser exportadas como **`export default`**.
- Cada subpasta dentro de **`/src/actions`** deve conter um **`index.ts`**.
  - O arquivo `index.ts` deve **importar todas as actions** de sua pasta (cada uma com `export default`) e **exportá-las**.
- Todas as actions devem retornar o tipo **`ActionResponse`**, definido em **`/src/types/action-response.d.ts`**.

Exemplo:

```ts
// /src/actions/sign-in.ts
import { createClient } from '@/lib/supabase/server'
import { ActionResponse } from '@/types/action-response'

export default async function signInAction({ email, password }: { email: string; password: string }): Promise<ActionResponse> {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { success: false, error: error.message }
  return { success: true, data }
}
```

---

## ⚛️ Componentes React

- Todos os componentes React devem ser declarados como arrow functions com export nomeado:

```tsx
export const MyComponent = () => {
  return <div>Hello World</div>
}
```

- Nunca use `export default` em componentes React.

---

## 📜 Schemas Zod

- Todos os schemas Zod devem ser armazenados em **`/lib/definitions`**.
- Cada arquivo dentro dessa pasta deve conter **apenas UM schema**.
- Nomeie os arquivos conforme o domínio da entidade, ex: `user-schema.ts`, `product-schema.ts`, etc.

Exemplo:

```ts
// /lib/definitions/sign-in-schema.ts
import { z } from 'zod'

export const signInSchema = z.object({
  email: z.email(),
  password: z.string().min(6),
})
```

---

## 🧪 Testes e Tipagem

- O tipo **`ActionResponse`** deve sempre ser usado como retorno padrão em actions server.
- A função `createClient` do Supabase deve ser importada de `/lib/supabase/server`.
- Sempre trate erros e retorne mensagens descritivas no formato `{ success: boolean; data?: any; error?: string }`.

---

## 🧭 Boas práticas gerais

- Use **TypeScript** em todos os arquivos.
- Prefira **async/await** a `.then()`.
- Sempre trate erros com `try/catch` em actions server.
- Evite side effects dentro das actions, a menos que sejam controlados (ex: logging).

---

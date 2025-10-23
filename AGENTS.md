# AGENTS.md

## 📂 Estrutura de ações (Server Actions)

- Todas as actions dentro de **`/src/actions`** devem ser exportadas como **`export default`**.
- Cada subpasta dentro de **`/src/actions`** deve conter um **`index.ts`**.
  - O arquivo `index.ts` deve **importar todas as actions** de sua pasta (cada uma com `export default`) e **exportá-las**.
- Todas as actions devem retornar o tipo **`ActionResponse`**, definido em **`/src/types/action-response.d.ts`**.

Exemplo (padrão de retorno e tratamento de erro):

```ts
// /src/actions/sign-in.ts
import { createClient } from '@/lib/supabase/server'
import type { ActionResponse } from '@/types/action-response'

export default async function signInAction({
  email,
  password,
}: {
  email: string
  password: string
}): Promise<ActionResponse<{ user: any }>> {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    return { success: false, message: error.message }
  }
  return { success: true, message: 'Login efetuado com sucesso', data: data.user }
}
```

---

## ⚛️ Componentes React

- Todos os componentes React devem ser declarados como arrow functions com export **nomeado** (não usar export default):

```tsx
export const MyComponent = () => {
  return <div>Hello World</div>
}
```

---

## 📜 Schemas Zod — **ESTILO OBRIGATÓRIO**

> **Atenção:** use exatamente o estilo abaixo. O Codex vinha gerando schemas com `required_error` e `z.string().email()`. **Não** usar `required_error`. **Não** usar `z.string().email()`. O formato correto é **`z.email()`** direto.

- Todos os schemas Zod devem estar em **`/lib/definitions`**.
- **Apenas UM schema por arquivo**.
- Estilo obrigatório (exemplo para *sign-in*):

```ts
import { z } from 'zod'

export const signInSchema = z.object({
  email: z.email('Informe um email válido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
})

// (Opcional) tipo inferido
export type SignInSchema = z.infer<typeof signInSchema>
```

- **Proibido** (não gerar assim):

```ts
// ❌ NÃO usar `required_error` nem `z.string().email()`
import { z } from 'zod'

export const signInSchema = z.object({
  email: z.string({ required_error: 'Informe um email' }).email('Informe um email válido'),
  password: z.string({ required_error: 'Informe uma senha' }).min(6, 'A senha deve ter pelo menos 6 caracteres'),
})
```

---

## 🧪 Testes e Tipagem

- O tipo **`ActionResponse`** deve sempre ser usado como retorno padrão em actions server.
- A função `createClient` do Supabase deve ser importada de `/lib/supabase/server`.
- Padrão de mensagem: `message` claro e descritivo em casos de sucesso e erro.

---

## 🧭 Boas práticas gerais

- Use **TypeScript** em todos os arquivos.
- Prefira **async/await** a `.then()`.
- Sempre trate erros com `try/catch` ou checagem explícita de `error` em chamadas Supabase.
- Evite side effects nas actions (ex.: logs sensíveis).
- Utilize imports absolutos com alias `@/`.

---

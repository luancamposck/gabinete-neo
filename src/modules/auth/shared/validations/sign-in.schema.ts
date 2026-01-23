// @/modules/auth/shared/validations/sign-in.schema.ts

import { z } from "zod"

export const signInSchema = z.object({
	email: z.email("Informe um email valido").trim().toLowerCase(),
	password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres")
})

export type SignInSchemaData = z.infer<typeof signInSchema>

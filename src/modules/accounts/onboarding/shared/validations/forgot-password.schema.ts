// @/modules/accounts/onboarding/shared/validations/forgot-password.schema.ts

import { z } from "zod"

export const forgotPasswordSchema = z.object({
	email: z.email("Informe um e-mail válido.").min(3, "O e-mail é obrigatório.")
})

export type ForgotPasswordSchemaData = z.infer<typeof forgotPasswordSchema>

// @/modules/accounts/onboarding/shared/validations/reset-password.schema.ts

import { z } from "zod"

const passwordSchema = z.string().min(8, "A senha deve ter no mínimo 8 caracteres.")

export const resetPasswordSchema = z
	.object({
		password: passwordSchema,
		confirmPassword: passwordSchema
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "As senhas não coincidem.",
		path: ["confirmPassword"]
	})

export type ResetPasswordSchemaData = z.infer<typeof resetPasswordSchema>

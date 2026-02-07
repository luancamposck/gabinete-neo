// @/modules/auth/server/slices/request-password-reset/actions/request-password-reset.action.ts

"use server"

import { forgotPasswordSchema } from "@/modules/accounts/onboarding/shared/validations/forgot-password.schema"
import { requestPasswordResetService } from "@/modules/auth/server/services/request-password-reset.service"

const INVALID_INPUT_MESSAGE = "Dados inválidos. Verifique os campos e tente novamente."

export async function requestPasswordResetAction(formData: unknown) {
	console.log(formData)
	const parsed = forgotPasswordSchema.safeParse(formData)

	if (parsed.success === false) {
		console.error(parsed.error)

		return {
			success: false,
			message: INVALID_INPUT_MESSAGE
		}
	}

	const { email } = parsed.data

	return requestPasswordResetService({ email })
}

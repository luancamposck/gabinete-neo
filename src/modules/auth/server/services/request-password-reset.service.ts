// @/modules/auth/server/services/request-password-reset.service.ts

import { requestPasswordResetRepo } from "@/modules/auth/server/repos/request-password-reset.repo"
import type { OperationResponse } from "@/shared/types/operation-response.types"

const GENERIC_RESET_PASSWORD_ERROR = "Não foi possível enviar o link de redefinição. Tente novamente mais tarde."
const RESET_PASSWORD_SUCCESS = "Enviamos um link de redefinição para seu e-mail."
const prefixLog = "[requestPasswordResetService]:"

export async function requestPasswordResetService({ email }: { email: string }): OperationResponse<null> {
	try {
		const { error } = await requestPasswordResetRepo({ email })

		if (error) {
			console.error(`${prefixLog} ${error.message}`)
			return {
				success: false,
				message: GENERIC_RESET_PASSWORD_ERROR
			}
		}

		return {
			success: true,
			message: RESET_PASSWORD_SUCCESS,
			data: null
		}
	} catch (error) {
		console.error(`${prefixLog} unexpected error:`, error)
		return {
			success: false,
			message: GENERIC_RESET_PASSWORD_ERROR
		}
	}
}

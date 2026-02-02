// @/modules/auth/server/services/update-password.service.ts

import { updatePasswordRepo } from "@/modules/auth/server/repos/update-password.repo"
import type { OperationResponse } from "@/shared/types/operation-reponse.types"

const GENERIC_UPDATE_PASSWORD_ERROR = "Não foi possível atualizar sua senha. Tente novamente mais tarde."
const UPDATE_PASSWORD_SUCCESS = "Senha atualizada com sucesso."
const SAME_PASSWORD = "A nova senha deve ser diferente da atual."
const prefixLog = "[updatePasswordService]:"

export async function updatePasswordService({ newPassword }: { newPassword: string }): OperationResponse<null> {
	try {
		const { error } = await updatePasswordRepo({ newPassword })

		if (error) {
			if (error.code === "same_password") {
				return {
					success: false,
					message: SAME_PASSWORD
				}
			}
			console.error(`${prefixLog} ${error.message}`)
			return {
				success: false,
				message: GENERIC_UPDATE_PASSWORD_ERROR
			}
		}

		return {
			success: true,
			message: UPDATE_PASSWORD_SUCCESS,
			data: null
		}
	} catch (error) {
		console.error(`${prefixLog} unexpected error:`, error)
		return {
			success: false,
			message: GENERIC_UPDATE_PASSWORD_ERROR
		}
	}
}

// @/modules/accounts/users/server/services/get-user-id-by-username.service.ts

import { findUserIdByUsernameAdminRepo } from "@/modules/accounts/users/server/repos/find-user-id-by-username.admin.repo"
import type { OperationResponse } from "@/shared/types/operation-reponse.types"

const GENERIC_ERROR = "Não foi possível obter o usuário. Tente novamente mais tarde."
const NOT_FOUND_MESSAGE = "Usuário não encontrado."
const SUCCESS_MESSAGE = "Usuário encontrado com sucesso."
const prefixLog = "[getUserIdByUsernameService]:"

export async function getUserIdByUsernameService({ username }: { username: string }): OperationResponse<{ userId: string }> {
	try {
		const usernameNormalized = username.trim().toLowerCase()

		const { data, error } = await findUserIdByUsernameAdminRepo({ username: usernameNormalized })

		if (error) {
			console.error(`${prefixLog} ${error.message}`)
			return { success: false, message: GENERIC_ERROR }
		}

		const userId = data?.id
		if (!userId) {
			return { success: false, message: NOT_FOUND_MESSAGE }
		}

		return {
			success: true,
			message: SUCCESS_MESSAGE,
			data: { userId }
		}
	} catch (error) {
		console.error(`${prefixLog} unexpected error:`, error)
		return { success: false, message: GENERIC_ERROR }
	}
}

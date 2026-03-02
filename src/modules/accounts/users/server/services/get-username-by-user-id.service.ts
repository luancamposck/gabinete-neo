// @/modules/accounts/users/server/services/get-username-by-user-id.service.ts

import { findUsernameByUserIdAdminRepo } from "@/modules/accounts/users/server/repos/find-username-by-user-id.admin.repo"
import type { OperationResponse } from "@/shared/types/operation-response.types"

const GENERIC_ERROR = "Não foi possível obter seu username. Tente novamente mais tarde."
const SUCCESS_MESSAGE = "Username obtido com sucesso."
const prefixLog = "[getUsernameByUserIdService]:"

export async function getUsernameByUserIdService({ userId }: { userId: string }): OperationResponse<{ username: string }> {
	try {
		const { data, error } = await findUsernameByUserIdAdminRepo({ userId })

		if (error) {
			console.error(`${prefixLog} ${error.message}`)
			return { success: false, message: GENERIC_ERROR }
		}

		const username = data?.username
		if (!username) {
			console.error(`${prefixLog} missing username for user_id=${userId}`)
			return { success: false, message: GENERIC_ERROR }
		}

		return {
			success: true,
			message: SUCCESS_MESSAGE,
			data: { username }
		}
	} catch (err) {
		console.error(`${prefixLog} unexpected error:`, err)
		return { success: false, message: GENERIC_ERROR }
	}
}

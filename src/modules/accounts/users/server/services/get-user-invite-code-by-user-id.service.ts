// @/modules/accounts/users/server/services/get-user-invite-code-by-user-id.service.ts

import { findUserInviteCodeByUserIdAdminRepo } from "@/modules/accounts/users/server/repos/find-user-invite-code-by-user-id.admin.repo"
import type { OperationResponse } from "@/shared/types/operation-reponse.types"

const GENERIC_ERROR = "Não foi possível obter seu código de convite. Tente novamente mais tarde."
const SUCCESS_MESSAGE = "Código de convite obtido com sucesso."
const prefixLog = "[getUserInviteCodeByUserIdService]:"

export async function getUserInviteCodeByUserIdService({ userId }: { userId: string }): OperationResponse<{ inviteCode: string }> {
	try {
		const { data, error } = await findUserInviteCodeByUserIdAdminRepo({ userId })

		if (error) {
			console.error(`${prefixLog} ${error.message}`)
			return { success: false, message: GENERIC_ERROR }
		}

		const inviteCode = data?.invite_code
		if (!inviteCode) {
			console.error(`${prefixLog} missing invite_code for user_id=${userId}`)
			return { success: false, message: GENERIC_ERROR }
		}

		return {
			success: true,
			message: SUCCESS_MESSAGE,
			data: { inviteCode }
		}
	} catch (err) {
		console.error(`${prefixLog} unexpected error:`, err)
		return { success: false, message: GENERIC_ERROR }
	}
}

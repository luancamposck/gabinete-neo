// @/modules/accounts/users/server/services/get-user-id-by-invite-code.service.ts

import { findUserIdByInviteCodeAdminRepo } from "@/modules/accounts/users/server/repos/find-user-id-by-invite-code.admin.repo"
import type { OperationResponse } from "@/shared/types/operation-reponse.types"

const GENERIC_ERROR = "Não foi possível validar o link de convite. Tente novamente mais tarde."
const INVALID_LINK_MESSAGE = "Link inválido."
const SUCCESS_MESSAGE = "Usuário encontrado com sucesso."
const prefixLog = "[getUserIdByInviteCodeService]:"

export async function getUserIdByInviteCodeService({ inviteCode }: { inviteCode: string }): OperationResponse<{ userId: string }> {
	try {
		const inviteCodeNormalized = inviteCode.trim().toLowerCase()

		if (!inviteCodeNormalized) {
			return { success: false, message: INVALID_LINK_MESSAGE }
		}

		const { data, error } = await findUserIdByInviteCodeAdminRepo({ inviteCode: inviteCodeNormalized })

		if (error) {
			console.error(`${prefixLog} ${error.message}`)
			return { success: false, message: GENERIC_ERROR }
		}

		const userId = data?.id
		if (!userId) {
			return { success: false, message: INVALID_LINK_MESSAGE }
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

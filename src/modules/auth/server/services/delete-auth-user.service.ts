// @/modules/auth/server/services/delete-auth-user.service.ts

import { deleteUserByIdAdminRepo } from "@/modules/auth/server/repos/delete-user-by-id.admin.repo"
import type { OperationResponse } from "@/shared/types/operation-response.types"

const GENERIC_DELETE_AUTH_USER_ERROR = "Não foi possível remover o usuário. Tente novamente mais tarde."
const DELETE_AUTH_USER_SUCCESS = "Usuário removido com sucesso."
const prefixLog = "[deleteAuthUserService]:"

export async function deleteAuthUserService({ userId }: { userId: string }): OperationResponse<null> {
	try {
		const { error: deleteUserError } = await deleteUserByIdAdminRepo({ userId })

		if (deleteUserError) {
			console.error(`${prefixLog} ${deleteUserError.message}`)
			return {
				success: false,
				message: GENERIC_DELETE_AUTH_USER_ERROR
			}
		}

		return {
			success: true,
			message: DELETE_AUTH_USER_SUCCESS,
			data: null
		}
	} catch (error) {
		console.error(`${prefixLog} unexpected error:`, error)
		return {
			success: false,
			message: GENERIC_DELETE_AUTH_USER_ERROR
		}
	}
}

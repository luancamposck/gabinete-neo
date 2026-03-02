import { findUserWithProfileRepo } from "@/modules/accounts/users/server/repos/find-user-with-profile.repo"
import type { UserWithProfileView } from "@/modules/accounts/users/shared/types/views"
import type { OperationResponse } from "@/shared/types/operation-response.types"

const GENERIC_ERROR = "Não foi possível obter o usuário. Tente novamente mais tarde."
const NOT_FOUND_MESSAGE = "Usuário não encontrado."
const SUCCESS_MESSAGE = "Usuário encontrado com sucesso."
const prefixLog = "[getUserWithProfileService]:"

type CodeList = "user_not_found" | "infra_error"

type GetUserWithProfileServiceRes = {
	userWithProfile: UserWithProfileView
}

export async function getUserWithProfileService({ userId }: { userId: string }): OperationResponse<GetUserWithProfileServiceRes, CodeList> {
	try {
		const { data, error } = await findUserWithProfileRepo({ userId })
		if (error) {
			console.error(`${prefixLog} ${error.message}`)
			return { success: false, message: GENERIC_ERROR }
		}

		if (!data) {
			return {
				success: false,
				message: NOT_FOUND_MESSAGE,
				code: "user_not_found"
			}
		}

		const userWithProfile = data

		return {
			success: true,
			message: SUCCESS_MESSAGE,
			data: { userWithProfile }
		}
	} catch (error) {
		console.error(`${prefixLog} unexpected error:`, error)
		return {
			success: false,
			message: GENERIC_ERROR,
			code: "infra_error"
		}
	}
}

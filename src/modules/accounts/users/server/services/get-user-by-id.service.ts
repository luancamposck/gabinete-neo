// @/modules/accounts/users/server/services/get-user-by-id.service.ts

import { findUserByIdRepo } from "@/modules/accounts/users/server/repos/find-user-by-id.repo"
import type { UserView } from "@/modules/accounts/users/shared/types/views"
import type { OperationResponse } from "@/shared/types/operation-reponse.types"

const GENERIC_ERROR = "Não foi possível obter o usuário. Tente novamente mais tarde."
const NOT_FOUND_MESSAGE = "Usuário não encontrado."
const SUCCESS_MESSAGE = "Usuário encontrado com sucesso."
const prefixLog = "[getUserByIdService]:"

type ErrorCodes = "user_not_found" | "infra_error"

export async function getUserByIdService({ userId }: { userId: string }): OperationResponse<{ user: UserView }, ErrorCodes> {
	try {
		const { data, error } = await findUserByIdRepo({ userId })

		if (error) {
			console.error(`${prefixLog} ${error.message}`)
			return {
				success: false,
				message: GENERIC_ERROR,
				code: "infra_error"
			}
		}

		if (!data) {
			return {
				success: false,
				message: NOT_FOUND_MESSAGE,
				code: "user_not_found"
			}
		}

		return {
			success: true,
			message: SUCCESS_MESSAGE,
			data: {
				user: data
			}
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

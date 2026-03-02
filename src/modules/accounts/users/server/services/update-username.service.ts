// @/modules/accounts/users/server/services/update-username.service.ts

import { updateUserRepo } from "@/modules/accounts/users/server/repos/update-user.repo"
import type { OperationResponse } from "@/shared/types/operation-response.types"

const GENERIC_UPDATE_USERNAME_ERROR = "Não foi possível atualizar o username. Tente novamente mais tarde."
const USERNAME_ALREADY_EXISTS_ERROR = "Este username já está em uso."
const UPDATE_USERNAME_SUCCESS = "Username atualizado com sucesso."
const prefixLog = "[updateUsernameService]:"

type UpdateUsernameParams = {
	userId: string
	username: string
}

type ErrorCodes = "username_already_exists" | "infra_error"

export async function updateUsernameService(params: UpdateUsernameParams): OperationResponse<{ userId: string; username: string }, ErrorCodes> {
	const usernameNormalized = params.username.trim().toLowerCase()

	try {
		const { data: updatedUser, error: updateError } = await updateUserRepo({
			userId: params.userId,
			updates: {
				username: usernameNormalized
			}
		})

		if (updateError) {
			console.error(`${prefixLog} ${updateError.message}`)
			if (updateError.code === "23505") {
				return {
					success: false,
					message: USERNAME_ALREADY_EXISTS_ERROR,
					code: "username_already_exists"
				}
			}
			return {
				success: false,
				message: GENERIC_UPDATE_USERNAME_ERROR,
				code: "infra_error"
			}
		}

		const userId = updatedUser.id

		return {
			success: true,
			message: UPDATE_USERNAME_SUCCESS,
			data: {
				userId,
				username: usernameNormalized
			}
		}
	} catch (error) {
		console.error(`${prefixLog} unexpected error:`, error)
		return {
			success: false,
			message: GENERIC_UPDATE_USERNAME_ERROR,
			code: "infra_error"
		}
	}
}

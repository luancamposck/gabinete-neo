// @/modules/accounts/users/server/services/create-user.service.ts

import { insertUserAdminRepo } from "@/modules/accounts/users/server/repos/insert-user.admin.repo"
import type { CreateUserParams } from "@/modules/accounts/users/shared/types/inputs"
import type { OperationResponse } from "@/shared/types/operation-response.types"

const GENERIC_CREATE_USER_ERROR = "Não foi possível criar o usuário. Tente novamente mais tarde."
const USERNAME_ALREADY_EXISTS_ERROR = "Este username já está em uso."
const CREATE_USER_SUCCESS = "Usuário criado com sucesso."
const prefixLog = "[createUserService]:"

export async function createUserService(params: CreateUserParams): OperationResponse<{ userId: string }> {
	try {
		const { data: insertUserData, error: insertUserError } = await insertUserAdminRepo(params)

		if (insertUserError) {
			console.error(`${prefixLog} ${insertUserError.message}`)
			if (insertUserError.code === "23505") {
				return {
					success: false,
					message: USERNAME_ALREADY_EXISTS_ERROR
				}
			}
			return {
				success: false,
				message: GENERIC_CREATE_USER_ERROR
			}
		}

		const userId = insertUserData?.id
		if (!userId) {
			console.error(`${prefixLog} missing user id after insert`)
			return {
				success: false,
				message: GENERIC_CREATE_USER_ERROR
			}
		}

		return {
			success: true,
			message: CREATE_USER_SUCCESS,
			data: {
				userId: userId
			}
		}
	} catch (error) {
		console.error(`${prefixLog} unexpected error:`, error)
		return {
			success: false,
			message: GENERIC_CREATE_USER_ERROR
		}
	}
}

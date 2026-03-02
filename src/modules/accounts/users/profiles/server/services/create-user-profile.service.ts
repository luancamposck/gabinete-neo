// @/modules/accounts/users/profiles/server/services/create-user-profile.service.ts

import { insertUserProfileAdminRepo } from "@/modules/accounts/users/profiles/server/repos/insert-profile.admin.repo"
import type { UserProfileInsert } from "@/modules/accounts/users/profiles/shared/types/db"
import type { CreateUserProfileParams } from "@/modules/accounts/users/profiles/shared/types/inputs"
import type { OperationResponse } from "@/shared/types/operation-response.types"

const GENERIC_CREATE_PROFILE_ERROR = "Não foi possível criar o perfil do usuário. Tente novamente mais tarde."
const CREATE_PROFILE_SUCCESS = "Perfil do usuário criado com sucesso."
const DUPLICATED_PHONE_NUMBER_ERROR = "Telefone já cadastrado para outro usuário."
const prefixLog = "[createUserProfileService]:"

export async function createUserProfileService(params: CreateUserProfileParams): OperationResponse<{ userId: string }> {
	const { userId, ...profile } = params

	const insertUserProfileAdminRepoParams: UserProfileInsert = {
		user_id: userId,
		...profile
	}

	try {
		const { data: insertUserData, error: insertUserError } = await insertUserProfileAdminRepo(insertUserProfileAdminRepoParams)

		if (insertUserError) {
			if (insertUserError.code === "23505") {
				return {
					success: false,
					message: DUPLICATED_PHONE_NUMBER_ERROR
				}
			}
			console.error(`${prefixLog} ${insertUserError.message}`)
			return {
				success: false,
				message: GENERIC_CREATE_PROFILE_ERROR
			}
		}

		const userId = insertUserData?.user_id
		if (!userId) {
			console.error(`${prefixLog} missing user id after insert`)
			return {
				success: false,
				message: GENERIC_CREATE_PROFILE_ERROR
			}
		}

		return {
			success: true,
			message: CREATE_PROFILE_SUCCESS,
			data: {
				userId: userId
			}
		}
	} catch (error) {
		console.error(`${prefixLog} unexpected error:`, error)
		return {
			success: false,
			message: GENERIC_CREATE_PROFILE_ERROR
		}
	}
}

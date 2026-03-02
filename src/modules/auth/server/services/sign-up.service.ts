// @/modules/auth/server/services/sign-up.service.ts

import { insertAuthUserAdminRepo } from "@/modules/auth/server/repos/auth.admin.repo"
import type { OperationResponse } from "@/shared/types/operation-response.types"

const GENERIC_SIGN_UP_ERROR = "Não foi possível criar o usuário. Tente novamente mais tarde."
const EMAIL_ALREADY_EXISTS_ERROR = "Este e-mail já está registrado no sistema."
const SIGN_UP_SUCCESS = "Usuário criado com sucesso."
const prefixLog = "[signUpService]:"

export async function signUpService(params: { email: string; password: string }): OperationResponse<{ userId: string }> {
	try {
		const { data: authUserData, error: authUserError } = await insertAuthUserAdminRepo(params)

		if (authUserError || !authUserData) {
			if (authUserError) {
				console.error(`${prefixLog} ${authUserError.message}`)
			}

			if (authUserError?.code === "email_exists") {
				return {
					success: false,
					message: EMAIL_ALREADY_EXISTS_ERROR,
					code: "email_exists"
				}
			}

			return {
				success: false,
				message: GENERIC_SIGN_UP_ERROR
			}
		}

		const userId = authUserData.user.id

		return {
			success: true,
			message: SIGN_UP_SUCCESS,
			data: {
				userId: userId
			}
		}
	} catch (error) {
		console.error(`${prefixLog} unexpected error:`, error)
		return {
			success: false,
			message: GENERIC_SIGN_UP_ERROR
		}
	}
}

// @/modules/auth/server/services/sign-in.service.ts
import { signInRepo } from "@/modules/auth/server/repos/auth.repo"
import type { OperationResponse } from "@/shared/types/operation-reponse.types"

const GENERIC_SIGN_IN_ERROR = "Não foi possível entrar. Tente novamente mais tarde."
const INVALID_CREDENTIALS_ERROR = "E-mail ou senha inválidos."
const SIGN_IN_SUCCESS = "Login realizado com sucesso."
const prefixLog = "[signInService]:"

export async function signInService(params: { email: string; password: string }): OperationResponse<{ userId: string }> {
	try {
		const { data: authUserData, error: authUserError } = await signInRepo(params)

		if (authUserError) {
			console.error(`${prefixLog} ${authUserError.message}`)
			if (authUserError.code === "invalid_credentials") {
				return {
					success: false,
					message: INVALID_CREDENTIALS_ERROR,
					code: "invalid_credentials"
				}
			}
			return {
				success: false,
				message: GENERIC_SIGN_IN_ERROR
			}
		}

		const userId = authUserData.user.id

		return {
			success: true,
			message: SIGN_IN_SUCCESS,
			data: {
				userId: userId
			}
		}
	} catch (error) {
		console.error(`${prefixLog} unexpected error:`, error)
		return {
			success: false,
			message: GENERIC_SIGN_IN_ERROR
		}
	}
}

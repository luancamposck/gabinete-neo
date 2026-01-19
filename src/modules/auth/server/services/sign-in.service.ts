// @/modules/auth/server/services/sign-in.service.ts
import { signInRepo } from "@/modules/auth/server/repos/auth.repo"
import type { OperationResponse } from "@/shared/types/operation-reponse.types"

const GENERIC_SIGN_IN_ERROR = "Nao foi possivel entrar. Tente novamente mais tarde."
const INVALID_CREDENTIALS_ERROR = "Email ou senha invalidos."
const SIGN_IN_SUCCESS = "Login realizado com sucesso."

export async function signInService(params: { email: string; password: string }): OperationResponse<{ userId: string }> {
	try {
		const { data: authUserData, error: authUserError } = await signInRepo(params)

		if (authUserError) {
			if (authUserError.code === "invalid_credentials") {
				return {
					success: false,
					message: INVALID_CREDENTIALS_ERROR
				}
			}
			console.error(`[signInService]: ${authUserError.message}`)
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
		console.error("[signInService] unexpected error:", error)
		return {
			success: false,
			message: GENERIC_SIGN_IN_ERROR
		}
	}
}

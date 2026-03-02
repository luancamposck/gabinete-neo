// @/modules/auth/server/services/sign-out.service.ts

import { signOutRepo } from "@/modules/auth/server/repos/sign-out.repo"
import type { OperationResponse } from "@/shared/types/operation-response.types"

const GENERIC_SIGN_OUT_ERROR = "Não foi possível sair. Tente novamente mais tarde."
const SIGN_OUT_SUCCESS = "Logout realizado com sucesso."
const prefixLog = "[signOutService]:"

export async function signOutService(): OperationResponse<null> {
	try {
		const { error: signOutError } = await signOutRepo()

		if (signOutError) {
			console.error(`${prefixLog} ${signOutError.message}`)

			return {
				success: false,
				message: GENERIC_SIGN_OUT_ERROR
			}
		}

		return {
			success: true,
			message: SIGN_OUT_SUCCESS,
			data: null
		}
	} catch (error) {
		console.error(`${prefixLog} unexpected error:`, error)
		return {
			success: false,
			message: GENERIC_SIGN_OUT_ERROR
		}
	}
}

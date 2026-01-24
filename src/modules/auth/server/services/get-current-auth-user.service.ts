// @/modules/auth/server/services/get-current-auth-user.service.ts

import type { User } from "@supabase/supabase-js"
import { getCurrentAuthUserRepo } from "@/modules/auth/server/repos/get-user.repo"
import type { OperationResponse } from "@/shared/types/operation-reponse.types"

const GENERIC_GET_CURRENT_AUTH_USER_ERROR = "Não foi possível obter o usuário atual. Tente novamente mais tarde."
const GET_CURRENT_AUTH_USER_SUCCESS = "Usuário atual obtido com sucesso."
const CURRENT_AUTH_USER_NOT_FOUND = "Nenhum usuário autenticado."
const prefixLog = "[getCurrentAuthUserService]:"

export async function getCurrentAuthUserService(): OperationResponse<{ user: User }> {
	try {
		const { data, error } = await getCurrentAuthUserRepo()

		if (error) {
			console.error(`${prefixLog} ${error.message}`)
			return {
				success: false,
				message: GENERIC_GET_CURRENT_AUTH_USER_ERROR
			}
		}

		if (!data.user) {
			console.error(`${prefixLog} Sem usuário logado`)
			return {
				success: false,
				message: CURRENT_AUTH_USER_NOT_FOUND
			}
		}

		return {
			success: true,
			message: GET_CURRENT_AUTH_USER_SUCCESS,
			data: {
				user: data.user
			}
		}
	} catch (error) {
		console.error(`${prefixLog} unexpected error:`, error)
		return {
			success: false,
			message: GENERIC_GET_CURRENT_AUTH_USER_ERROR
		}
	}
}

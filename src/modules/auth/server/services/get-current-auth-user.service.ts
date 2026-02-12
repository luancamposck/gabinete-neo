// @/modules/auth/server/services/get-current-auth-user.service.ts

import type { User } from "@supabase/supabase-js"
import { getCurrentAuthUserRepo } from "@/modules/auth/server/repos/get-user.repo"
import { rethrowIfNextError } from "@/shared/infra/next/rethrow-if-next-error"
import type { OperationResponse } from "@/shared/types/operation-reponse.types"

const GENERIC_GET_CURRENT_AUTH_USER_ERROR = "Não foi possível obter o usuário atual. Tente novamente mais tarde."
const GET_CURRENT_AUTH_USER_SUCCESS = "Usuário atual obtido com sucesso."
const CURRENT_AUTH_USER_NOT_FOUND = "Nenhum usuário autenticado."
const prefixLog = "[getCurrentAuthUserService]:"
const AUTH_SESSION_MISSING_ERROR_NAME = "AuthSessionMissingError"

type ErrorCodes = "unauthenticated" | "infra_error"

export async function getCurrentAuthUserService(): OperationResponse<{ user: User }, ErrorCodes> {
	try {
		const { data, error } = await getCurrentAuthUserRepo()

		if (error) {
			const isUnauthenticatedByMissingSession = error.name === AUTH_SESSION_MISSING_ERROR_NAME || error.message === "Auth session missing!"

			if (isUnauthenticatedByMissingSession) {
				return {
					success: false,
					message: CURRENT_AUTH_USER_NOT_FOUND,
					code: "unauthenticated"
				}
			}

			console.error(`${prefixLog} ${error.message}`)
			return {
				success: false,
				message: GENERIC_GET_CURRENT_AUTH_USER_ERROR,
				code: "infra_error"
			}
		}

		if (!data.user) {
			console.error(`${prefixLog} Sem usuário logado`)
			return {
				success: false,
				message: CURRENT_AUTH_USER_NOT_FOUND,
				code: "unauthenticated"
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
		rethrowIfNextError(error)

		console.error(`${prefixLog} unexpected error:`, error)
		return {
			success: false,
			message: GENERIC_GET_CURRENT_AUTH_USER_ERROR,
			code: "infra_error"
		}
	}
}

// @/modules/users/server/services/check-username-available.service.ts

import type { AppResultAsync } from "@/shared/types/app-result.types"
import type { CheckUsernameAvailableServiceCodes, CheckUsernameAvailableServiceData, CheckUsernameAvailableServiceParams } from "../../shared/types/slices/check-username-available.types"
import { selectUserIdByUsernameAdminRepo } from "../repos/select-user-id-by-username.admin.repo"

const prefixLog = "[checkUsernameAvailableService]:"

const FALLBACK_ERROR = {
	success: false,
	code: "generic_error"
} as const

/**
 * Verifica se um username já está em uso.
 *
 * Responsabilidades:
 * - Consultar public.users por username antes de admin.createUser() ser chamado.
 * - Retornar um code estável e distinguível ("username_taken") em vez de deixar
 *   a violação UNIQUE ser detectada só dentro da trigger de sync de auth.users,
 *   cujo erro chega opaco pela Supabase Auth Admin API.
 *
 * @param params - Dados usados para checar a disponibilidade do username.
 * @param params.username - Username a verificar.
 *
 * @returns Uma resposta padronizada da operação, sem dado em caso de sucesso.
 */
export async function checkUsernameAvailableService(params: CheckUsernameAvailableServiceParams): AppResultAsync<CheckUsernameAvailableServiceData, CheckUsernameAvailableServiceCodes> {
	try {
		const { data, error } = await selectUserIdByUsernameAdminRepo({ username: params.username })

		if (error) {
			console.error(`${prefixLog} database error`, {
				code: error.code,
				details: error.details,
				hint: error.hint
			})
			return FALLBACK_ERROR
		}

		if (data) {
			return {
				success: false,
				code: "username_taken"
			}
		}

		return {
			success: true,
			data: null
		}
	} catch (error) {
		console.error(`${prefixLog} unexpected error:`, error)
		return FALLBACK_ERROR
	}
}

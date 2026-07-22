// @/modules/users/profiles/server/services/check-phone-available.service.ts

import type { AppResultAsync } from "@/shared/types/app-result.types"
import type { CheckPhoneAvailableServiceCodes, CheckPhoneAvailableServiceData, CheckPhoneAvailableServiceParams } from "../../shared/types/slices/check-phone-available.types"
import { selectUserIdByPhoneAdminRepo } from "../repos/select-user-id-by-phone.admin.repo"

const prefixLog = "[checkPhoneAvailableService]:"

const FALLBACK_ERROR = {
	success: false,
	code: "generic_error"
} as const

/**
 * Verifica se um telefone já está em uso por outro perfil.
 *
 * Responsabilidades:
 * - Consultar public.user_profiles por phone antes de admin.createUser() ser chamado.
 * - Retornar um code estável e distinguível ("phone_taken") em vez de deixar a
 *   violação UNIQUE ser detectada só dentro da trigger de sync de auth.users,
 *   cujo erro chega opaco pela Supabase Auth Admin API.
 *
 * @param params - Dados usados para checar a disponibilidade do telefone.
 * @param params.phone - Telefone (somente dígitos) a verificar.
 *
 * @returns Uma resposta padronizada da operação, sem dado em caso de sucesso.
 */
export async function checkPhoneAvailableService(params: CheckPhoneAvailableServiceParams): AppResultAsync<CheckPhoneAvailableServiceData, CheckPhoneAvailableServiceCodes> {
	try {
		const { data, error } = await selectUserIdByPhoneAdminRepo({ phone: params.phone })

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
				code: "phone_taken"
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

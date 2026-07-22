// @/modules/users/server/services/lookup-user-id-by-email.service.ts

import type { AppResultAsync } from "@/shared/types/app-result.types"
import type { LookupUserIdByEmailServiceCodes, LookupUserIdByEmailServiceData, LookupUserIdByEmailServiceParams } from "../../shared/types/slices/lookup-user-id-by-email.types"
import { selectUserIdByEmailAdminRepo } from "../repos/select-user-id-by-email.admin.repo"

const prefixLog = "[lookupUserIdByEmailService]:"

const FALLBACK_ERROR = {
	success: false,
	code: "generic_error"
} as const

/**
 * Busca o id de public.users por email, sem tratar "não encontrado" como erro.
 *
 * Responsabilidades:
 * - Decidir, antes de qualquer outra checagem, se o email já pertence a uma
 *   conta existente. É usado para o branch novo-vs-existente no cadastro,
 *   não como um pré-check de rejeição (por isso "não encontrado" é sucesso
 *   com userId null, diferente de checkUsernameAvailableService/checkPhoneAvailableService).
 *
 * @param params - Dados usados para localizar o usuário.
 * @param params.email - Email a buscar.
 *
 * @returns Uma resposta padronizada da operação contendo o userId (ou null se não encontrado).
 */
export async function lookupUserIdByEmailService(params: LookupUserIdByEmailServiceParams): AppResultAsync<LookupUserIdByEmailServiceData, LookupUserIdByEmailServiceCodes> {
	try {
		const { data, error } = await selectUserIdByEmailAdminRepo({ email: params.email })

		if (error) {
			console.error(`${prefixLog} database error`, {
				code: error.code,
				details: error.details,
				hint: error.hint
			})
			return FALLBACK_ERROR
		}

		return {
			success: true,
			data: {
				userId: data?.id ?? null
			}
		}
	} catch (error) {
		console.error(`${prefixLog} unexpected error:`, error)
		return FALLBACK_ERROR
	}
}

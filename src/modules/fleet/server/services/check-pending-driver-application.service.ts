// @/modules/fleet/server/services/check-pending-driver-application.service.ts

import type {
	CheckPendingDriverApplicationServiceCodes,
	CheckPendingDriverApplicationServiceData,
	CheckPendingDriverApplicationServiceParams
} from "@/modules/fleet/server/types/operations/check-pending-driver-application.types"
import type { AppResultAsync } from "@/shared/types/app-result.types"
import { selectPendingDriverApplicationIdByOrganizationAndUserAdminRepo } from "../repos/select-pending-driver-application-id-by-organization-and-user.admin.repo"

const prefixLog = "[checkPendingDriverApplicationService]:"

const FALLBACK_ERROR = {
	success: false,
	code: "generic_error"
} as const

/**
 * Verifica se o usuário já tem uma candidatura pending na organização.
 *
 * Responsabilidades:
 * - Consultar driver_applications por organization_id + user_id + status='pending'.
 * - Retornar um code estável ("pending_application_exists") em vez de deixar
 *   duas candidaturas simultâneas do mesmo usuário coexistirem.
 *
 * @param params - Dados usados para checar candidatura pendente existente.
 * @param params.organizationId - Organização em que a candidatura seria criada.
 * @param params.userId - Usuário candidato.
 *
 * @returns Uma resposta padronizada da operação, sem dado em caso de sucesso.
 */
export async function checkPendingDriverApplicationService(params: CheckPendingDriverApplicationServiceParams): AppResultAsync<CheckPendingDriverApplicationServiceData, CheckPendingDriverApplicationServiceCodes> {
	try {
		const { data, error } = await selectPendingDriverApplicationIdByOrganizationAndUserAdminRepo({
			organizationId: params.organizationId,
			userId: params.userId
		})

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
				code: "pending_application_exists"
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

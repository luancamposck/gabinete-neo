// @/modules/fleet/server/services/check-plate-available.service.ts

import type { AppResultAsync } from "@/shared/types/app-result.types"
import type { CheckPlateAvailableServiceCodes, CheckPlateAvailableServiceData, CheckPlateAvailableServiceParams } from "../../shared/types/slices/check-plate-available.types"
import { selectDriverApplicationIdByOrganizationAndPlateAdminRepo } from "../repos/select-driver-application-id-by-organization-and-plate.admin.repo"

const prefixLog = "[checkPlateAvailableService]:"

const FALLBACK_ERROR = {
	success: false,
	code: "generic_error"
} as const

/**
 * Verifica se uma placa já está em uso por uma candidatura ativa na organização.
 *
 * Responsabilidades:
 * - Consultar driver_applications por organization_id + plate, considerando
 *   apenas candidaturas pending/approved (rejected libera a placa).
 * - Retornar um code estável ("plate_taken") em vez de deixar a violação do
 *   índice único parcial ser detectada só no insert.
 *
 * @param params - Dados usados para checar a disponibilidade da placa.
 * @param params.organizationId - Organização em que a placa deve ser única.
 * @param params.plate - Placa normalizada (uppercase, sem separadores) a verificar.
 *
 * @returns Uma resposta padronizada da operação, sem dado em caso de sucesso.
 */
export async function checkPlateAvailableService(params: CheckPlateAvailableServiceParams): AppResultAsync<CheckPlateAvailableServiceData, CheckPlateAvailableServiceCodes> {
	try {
		const { data, error } = await selectDriverApplicationIdByOrganizationAndPlateAdminRepo({
			organizationId: params.organizationId,
			plate: params.plate
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
				code: "plate_taken"
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

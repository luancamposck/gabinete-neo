// @/modules/fleet/server/services/create-driver-application.service.ts

import type { AppResultAsync } from "@/shared/types/app-result.types"
import type { CreateDriverApplicationServiceCodes, CreateDriverApplicationServiceData, CreateDriverApplicationServiceParams } from "../../shared/types/slices/create-driver-application.types"
import { insertDriverApplicationAdminRepo } from "../repos/insert-driver-application.admin.repo"

const prefixLog = "[createDriverApplicationService]:"

const FALLBACK_ERROR = {
	success: false,
	code: "generic_error"
} as const

/**
 * Cria uma candidatura de motorista (driver_applications), sempre pending.
 *
 * Responsabilidades:
 * - Inserir os dados de veículo/documentos em public.driver_applications.
 * - Não decide status/revisor: essa linha sempre nasce pending (default da
 *   coluna). Aprovar é responsabilidade de outro fluxo, separado deste.
 * - Não faz nenhuma checagem de disponibilidade (placa/candidatura
 *   duplicada) — isso é responsabilidade de checkPlateAvailableService e
 *   checkPendingDriverApplicationService, chamadas antes desta pelo Use-case.
 *
 * @param params - Dados usados para criar a candidatura.
 * @param params.organizationId - Organização alvo da candidatura.
 * @param params.userId - Usuário candidato.
 * @param params.plate - Placa normalizada (uppercase, sem separadores).
 * @param params.vehicleType - Tipo do veículo.
 * @param params.vehicleModel - Modelo do veículo (opcional).
 * @param params.vehicleYear - Ano do veículo (opcional).
 * @param params.vehicleColor - Cor do veículo (opcional).
 * @param params.crlvDocumentPath - Path do CRLV no bucket privado fleet-documents.
 * @param params.cnhDocumentPath - Path da CNH no bucket privado fleet-documents.
 *
 * @returns Uma resposta padronizada da operação contendo o id da candidatura criada.
 */
export async function createDriverApplicationService(params: CreateDriverApplicationServiceParams): AppResultAsync<CreateDriverApplicationServiceData, CreateDriverApplicationServiceCodes> {
	try {
		const { data, error } = await insertDriverApplicationAdminRepo({
			organization_id: params.organizationId,
			user_id: params.userId,
			plate: params.plate,
			vehicle_type: params.vehicleType,
			vehicle_model: params.vehicleModel ?? null,
			vehicle_year: params.vehicleYear ?? null,
			vehicle_color: params.vehicleColor ?? null,
			crlv_document_path: params.crlvDocumentPath,
			cnh_document_path: params.cnhDocumentPath
		})

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
				applicationId: data.id
			}
		}
	} catch (error) {
		console.error(`${prefixLog} unexpected error:`, error)
		return FALLBACK_ERROR
	}
}

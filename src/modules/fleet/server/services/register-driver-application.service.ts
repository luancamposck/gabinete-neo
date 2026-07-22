// @/modules/fleet/server/services/register-driver-application.service.ts

import { registerDriverApplicationAdminRepo } from "@/modules/fleet/server/repos/register-driver-application.admin.repo"
import type { VehicleType } from "@/modules/fleet/shared/types/db"
import type { OperationResponse } from "@/shared/types/operation-response.types"

type RegisterDriverApplicationServiceParams = {
	organizationId: string
	userId: string
	plate: string
	vehicleType: VehicleType
	vehicleModel?: string | null
	vehicleYear?: number | null
	vehicleColor?: string | null
	crlvPath: string
	cnhPath: string
	invitedByUserId?: string | null
}

type RegisterDriverApplicationServiceRes = {
	applicationId: string
	joinedNow: boolean
}

type ErrorCodes = "plate_taken" | "application_pending_exists" | "infra_error"

const MSG_SUCCESS = "Candidatura de motorista registrada com sucesso."
const MSG_PLATE_TAKEN = "Já existe uma candidatura ativa para esta placa nesta organização."
const MSG_APPLICATION_PENDING_EXISTS = "Você já possui uma candidatura de motorista em análise."
const MSG_INFRA_ERROR = "Não foi possível registrar a candidatura. Tente novamente mais tarde."
const prefixLog = "[registerDriverApplicationService]:"

const FALLBACK_INFRA_ERROR = { success: false, message: MSG_INFRA_ERROR, code: "infra_error" } as const

export async function registerDriverApplicationService(params: RegisterDriverApplicationServiceParams): OperationResponse<RegisterDriverApplicationServiceRes, ErrorCodes> {
	try {
		const { data, error } = await registerDriverApplicationAdminRepo(params)

		if (error || !data) {
			console.error(`${prefixLog} rpc failed: ${error?.message ?? "missing data"}`)
			return FALLBACK_INFRA_ERROR
		}

		// A RPC retorna um objeto único (OUT params), não um array.
		switch (data.error_code) {
			case "plate_taken":
				return { success: false, message: MSG_PLATE_TAKEN, code: "plate_taken" }
			case "application_pending_exists":
				return { success: false, message: MSG_APPLICATION_PENDING_EXISTS, code: "application_pending_exists" }
			case "infra_error":
				return FALLBACK_INFRA_ERROR
			case null:
			case "":
				break
			default:
				console.error(`${prefixLog} unexpected error_code: ${data.error_code}`)
				return FALLBACK_INFRA_ERROR
		}

		if (!data.application_id) {
			console.error(`${prefixLog} missing application_id on success`)
			return FALLBACK_INFRA_ERROR
		}

		return {
			success: true,
			message: MSG_SUCCESS,
			data: {
				applicationId: data.application_id,
				joinedNow: data.joined_now
			}
		}
	} catch (error) {
		console.error(`${prefixLog} unexpected error:`, error)
		return FALLBACK_INFRA_ERROR
	}
}

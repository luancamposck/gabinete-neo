// @/modules/fleet/server/services/reject-driver-application.service.ts

import { rejectDriverApplicationAdminRepo } from "@/modules/fleet/server/repos/reject-driver-application.admin.repo"
import type { OperationResponse } from "@/shared/types/operation-response.types"

type RejectDriverApplicationServiceParams = {
	applicationId: string
	reviewerUserId: string
}

type RejectDriverApplicationServiceRes = {
	applicationId: string
}

type ErrorCodes = "already_reviewed" | "infra_error"

const MSG_SUCCESS = "Candidatura rejeitada com sucesso."
const MSG_ALREADY_REVIEWED = "Esta candidatura já foi revisada."
const MSG_INFRA_ERROR = "Não foi possível rejeitar a candidatura. Tente novamente mais tarde."
const prefixLog = "[rejectDriverApplicationService]:"

const FALLBACK_INFRA_ERROR = { success: false, message: MSG_INFRA_ERROR, code: "infra_error" } as const

export async function rejectDriverApplicationService(params: RejectDriverApplicationServiceParams): OperationResponse<RejectDriverApplicationServiceRes, ErrorCodes> {
	try {
		const { data, error } = await rejectDriverApplicationAdminRepo(params)

		if (error) {
			console.error(`${prefixLog} update failed: ${error.message}`)
			return FALLBACK_INFRA_ERROR
		}

		// O update filtra por status = 'pending'; sem linha afetada => já revisada.
		if (!data) {
			return { success: false, message: MSG_ALREADY_REVIEWED, code: "already_reviewed" }
		}

		return {
			success: true,
			message: MSG_SUCCESS,
			data: {
				applicationId: data.id
			}
		}
	} catch (error) {
		console.error(`${prefixLog} unexpected error:`, error)
		return FALLBACK_INFRA_ERROR
	}
}

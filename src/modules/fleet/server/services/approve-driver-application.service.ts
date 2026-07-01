// @/modules/fleet/server/services/approve-driver-application.service.ts

import { approveDriverApplicationAdminRepo } from "@/modules/fleet/server/repos/approve-driver-application.admin.repo"
import type { OperationResponse } from "@/shared/types/operation-response.types"

type ApproveDriverApplicationServiceParams = {
	applicationId: string
	reviewerUserId: string
}

type ApproveDriverApplicationServiceRes = {
	driverId: string
}

type ErrorCodes = "not_found" | "already_reviewed" | "infra_error"

const MSG_SUCCESS = "Candidatura aprovada com sucesso."
const MSG_NOT_FOUND = "Candidatura não encontrada."
const MSG_ALREADY_REVIEWED = "Esta candidatura já foi revisada."
const MSG_INFRA_ERROR = "Não foi possível aprovar a candidatura. Tente novamente mais tarde."
const prefixLog = "[approveDriverApplicationService]:"

const FALLBACK_INFRA_ERROR = { success: false, message: MSG_INFRA_ERROR, code: "infra_error" } as const

export async function approveDriverApplicationService(params: ApproveDriverApplicationServiceParams): OperationResponse<ApproveDriverApplicationServiceRes, ErrorCodes> {
	try {
		const { data, error } = await approveDriverApplicationAdminRepo(params)

		if (error || !data) {
			console.error(`${prefixLog} rpc failed: ${error?.message ?? "missing data"}`)
			return FALLBACK_INFRA_ERROR
		}

		// A RPC retorna um objeto único (OUT params), não um array.
		switch (data.error_code) {
			case "not_found":
				return { success: false, message: MSG_NOT_FOUND, code: "not_found" }
			case "already_reviewed":
				return { success: false, message: MSG_ALREADY_REVIEWED, code: "already_reviewed" }
			case "infra_error":
				return FALLBACK_INFRA_ERROR
			case null:
			case "":
				break
			default:
				console.error(`${prefixLog} unexpected error_code: ${data.error_code}`)
				return FALLBACK_INFRA_ERROR
		}

		if (!data.driver_id) {
			console.error(`${prefixLog} missing driver_id on success`)
			return FALLBACK_INFRA_ERROR
		}

		return {
			success: true,
			message: MSG_SUCCESS,
			data: {
				driverId: data.driver_id
			}
		}
	} catch (error) {
		console.error(`${prefixLog} unexpected error:`, error)
		return FALLBACK_INFRA_ERROR
	}
}

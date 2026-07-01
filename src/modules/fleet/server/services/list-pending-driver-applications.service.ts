// @/modules/fleet/server/services/list-pending-driver-applications.service.ts

import { listPendingDriverApplicationsRepo, type PendingDriverApplicationRow } from "@/modules/fleet/server/repos/list-pending-driver-applications.repo"
import type { OperationResponse } from "@/shared/types/operation-response.types"

type ServiceRes = {
	applications: PendingDriverApplicationRow[]
}

type ErrorCodes = "infra_error"

const MSG_SUCCESS = "Candidaturas pendentes carregadas com sucesso."
const MSG_INFRA_ERROR = "Não foi possível carregar as candidaturas pendentes. Tente novamente mais tarde."
const prefixLog = "[listPendingDriverApplicationsService]:"

export async function listPendingDriverApplicationsService(params: { organizationId: string }): OperationResponse<ServiceRes, ErrorCodes> {
	try {
		const { data, error } = await listPendingDriverApplicationsRepo(params)

		if (error) {
			console.error(`${prefixLog} ${error.message}`)
			return {
				success: false,
				message: MSG_INFRA_ERROR,
				code: "infra_error"
			}
		}

		return {
			success: true,
			message: MSG_SUCCESS,
			data: {
				applications: data ?? []
			}
		}
	} catch (error) {
		console.error(`${prefixLog} unexpected error:`, error)
		return {
			success: false,
			message: MSG_INFRA_ERROR,
			code: "infra_error"
		}
	}
}

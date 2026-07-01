"use server"

import { getPendingDriverApplicationsUseCase, type PendingDriverApplicationDTO } from "@/modules/fleet/server/slices/review-driver-applications/use-cases/get-pending-driver-applications.use-case"
import type { OperationResponse } from "@/shared/types/operation-response.types"

type ErrorCodes = "unauthenticated" | "org_not_found" | "not_allowed" | "infra_error"

type GetPendingDriverApplicationsActionRes = {
	organizationId: string
	applications: PendingDriverApplicationDTO[]
}

export async function getPendingDriverApplicationsAction(): OperationResponse<GetPendingDriverApplicationsActionRes, ErrorCodes> {
	const useCaseRes = await getPendingDriverApplicationsUseCase()

	if (useCaseRes.success === false) {
		return {
			success: false,
			message: useCaseRes.message,
			code: useCaseRes.code
		}
	}

	return {
		success: true,
		message: useCaseRes.message,
		data: {
			organizationId: useCaseRes.data.organizationId,
			applications: useCaseRes.data.applications
		}
	}
}

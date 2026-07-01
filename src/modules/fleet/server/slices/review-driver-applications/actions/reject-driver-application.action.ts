"use server"

import { revalidatePath } from "next/cache"
import { reviewDriverApplicationUseCase } from "@/modules/fleet/server/slices/review-driver-applications/use-cases/review-driver-application.use-case"
import type { OperationResponse } from "@/shared/types/operation-response.types"

type ErrorCodes = "unauthenticated" | "org_not_found" | "not_allowed" | "not_found" | "already_reviewed" | "infra_error"

type RejectDriverApplicationActionRes = {
	applicationId: string
}

export async function rejectDriverApplicationAction(params: { applicationId: string }): OperationResponse<RejectDriverApplicationActionRes, ErrorCodes> {
	const useCaseRes = await reviewDriverApplicationUseCase({
		applicationId: params.applicationId,
		action: "reject"
	})

	if (useCaseRes.success === false) {
		return {
			success: false,
			message: useCaseRes.message,
			code: useCaseRes.code
		}
	}

	revalidatePath("/dashboard/config/fleet")

	return {
		success: true,
		message: useCaseRes.message,
		data: {
			applicationId: useCaseRes.data.applicationId
		}
	}
}

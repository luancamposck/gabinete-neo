"use server"

import { revalidatePath } from "next/cache"
import { reviewDriverApplicationUseCase } from "@/modules/fleet/server/slices/review-driver-applications/use-cases/review-driver-application.use-case"
import type { OperationResponse } from "@/shared/types/operation-response.types"

type ErrorCodes = "unauthenticated" | "org_not_found" | "not_allowed" | "not_found" | "already_reviewed" | "infra_error"

type ApproveDriverApplicationActionRes = {
	applicationId: string
	driverId: string | null
}

export async function approveDriverApplicationAction(params: { applicationId: string }): OperationResponse<ApproveDriverApplicationActionRes, ErrorCodes> {
	const useCaseRes = await reviewDriverApplicationUseCase({
		applicationId: params.applicationId,
		action: "approve"
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
			applicationId: useCaseRes.data.applicationId,
			driverId: useCaseRes.data.driverId
		}
	}
}

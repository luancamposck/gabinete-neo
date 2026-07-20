// @/modules/fleet/server/services/reject-driver-application.service.ts

import { rejectDriverApplicationAdminRepo } from "@/modules/fleet/server/repos/reject-driver-application.admin.repo"
import type { RejectDriverApplicationServiceCodes, RejectDriverApplicationServiceData } from "@/modules/fleet/shared/types/slices/review-driver-application.types"
import type { AppResultAsync } from "@/shared/types/app-result.types"

const prefixLog = "[rejectDriverApplicationService]:"

const FALLBACK_GENERIC_ERROR = { success: false, code: "generic_error" } as const

export async function rejectDriverApplicationService(params: { applicationId: string; reviewerUserId: string }): AppResultAsync<RejectDriverApplicationServiceData, RejectDriverApplicationServiceCodes> {
	try {
		const { data, error } = await rejectDriverApplicationAdminRepo(params)

		if (error) {
			console.error(`${prefixLog} update failed: ${error.message}`)
			return FALLBACK_GENERIC_ERROR
		}

		// O update filtra por status = 'pending'; sem linha afetada => já revisada.
		if (!data) {
			return { success: false, code: "already_reviewed" }
		}

		return {
			success: true,
			data: {
				applicationId: data.id
			}
		}
	} catch (error) {
		console.error(`${prefixLog} unexpected error:`, error)
		return FALLBACK_GENERIC_ERROR
	}
}

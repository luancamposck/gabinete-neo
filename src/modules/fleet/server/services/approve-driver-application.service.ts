// @/modules/fleet/server/services/approve-driver-application.service.ts

import { approveDriverApplicationAdminRepo } from "@/modules/fleet/server/repos/approve-driver-application.admin.repo"
import type { ApproveDriverApplicationServiceCodes, ApproveDriverApplicationServiceData, ApproveDriverApplicationServiceParams } from "@/modules/fleet/shared/types/slices/review-driver-application.types"
import type { AppResultAsync } from "@/shared/types/app-result.types"

const prefixLog = "[approveDriverApplicationService]:"

const FALLBACK_GENERIC_ERROR = { success: false, code: "generic_error" } as const

export async function approveDriverApplicationService(params: ApproveDriverApplicationServiceParams): AppResultAsync<ApproveDriverApplicationServiceData, ApproveDriverApplicationServiceCodes> {
	try {
		const { data, error } = await approveDriverApplicationAdminRepo(params)

		if (error || !data) {
			console.error(`${prefixLog} rpc failed: ${error?.message ?? "missing data"}`)
			return FALLBACK_GENERIC_ERROR
		}

		// A RPC retorna um objeto único (OUT params), não um array.
		switch (data.error_code) {
			case "not_found":
				return { success: false, code: "not_found" }
			case "already_reviewed":
				return { success: false, code: "already_reviewed" }
			case "infra_error":
				return FALLBACK_GENERIC_ERROR
			case null:
			case "":
				break
			default:
				console.error(`${prefixLog} unexpected error_code: ${data.error_code}`)
				return FALLBACK_GENERIC_ERROR
		}

		if (!data.driver_id) {
			console.error(`${prefixLog} missing driver_id on success`)
			return FALLBACK_GENERIC_ERROR
		}

		return {
			success: true,
			data: {
				driverId: data.driver_id
			}
		}
	} catch (error) {
		console.error(`${prefixLog} unexpected error:`, error)
		return FALLBACK_GENERIC_ERROR
	}
}

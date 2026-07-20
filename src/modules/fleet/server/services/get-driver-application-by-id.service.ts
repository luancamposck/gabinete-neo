import { getDriverApplicationByIdAdminRepo } from "@/modules/fleet/server/repos/get-driver-application-by-id.admin.repo"
import type { GetDriverApplicationByIdServiceCodes, GetDriverApplicationByIdServiceData } from "@/modules/fleet/shared/types/slices/review-driver-application.types"
import type { AppResultAsync } from "@/shared/types/app-result.types"

const prefixLog = "[getDriverApplicationByIdService]:"

const FALLBACK_GENERIC_ERROR = { success: false, code: "generic_error" } as const

export async function getDriverApplicationByIdService(params: { applicationId: string }): AppResultAsync<GetDriverApplicationByIdServiceData, GetDriverApplicationByIdServiceCodes> {
	try {
		const { data, error } = await getDriverApplicationByIdAdminRepo(params)

		if (error) {
			console.error(`${prefixLog} load application failed`, {
				code: error.code,
				details: error.details,
				hint: error.hint
			})
			return FALLBACK_GENERIC_ERROR
		}

		if (!data) {
			return { success: false, code: "not_found" }
		}

		return { success: true, data }
	} catch (error) {
		console.error(`${prefixLog} unexpected error:`, error)
		return FALLBACK_GENERIC_ERROR
	}
}

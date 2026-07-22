// @/modules/fleet/server/services/list-pending-driver-applications.service.ts

import type { AppResultAsync } from "@/shared/types/app-result.types"
import type { ListPendingDriverApplicationsServiceCodes, ListPendingDriverApplicationsServiceData, ListPendingDriverApplicationsServiceParams } from "../../shared/types/slices/list-pending-driver-applications.types"
import { listPendingDriverApplicationsAdminRepo } from "../repos/list-pending-driver-applications.admin.repo"

const prefixLog = "[listPendingDriverApplicationsService]:"

const FALLBACK_ERROR = {
	success: false,
	code: "generic_error"
} as const

export async function listPendingDriverApplicationsService(params: ListPendingDriverApplicationsServiceParams): AppResultAsync<ListPendingDriverApplicationsServiceData, ListPendingDriverApplicationsServiceCodes> {
	try {
		const { data, error } = await listPendingDriverApplicationsAdminRepo(params)

		if (error) {
			console.error(`${prefixLog} database error`, {
				code: error.code,
				details: error.details,
				hint: error.hint
			})
			return FALLBACK_ERROR
		}

		return {
			success: true,
			data: {
				applications: (data ?? []) as ListPendingDriverApplicationsServiceData["applications"]
			}
		}
	} catch (error) {
		console.error(`${prefixLog} unexpected error:`, error)
		return FALLBACK_ERROR
	}
}

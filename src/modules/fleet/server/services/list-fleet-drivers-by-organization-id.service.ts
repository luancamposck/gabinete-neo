import { listDriversWithMemberAndOriginApplicationByOrganizationIdAdminRepo } from "@/modules/fleet/server/repos/list-drivers-with-member-and-origin-application-by-organization-id.admin.repo"
import type { ListFleetDriversByOrganizationIdServiceData } from "@/modules/fleet/server/types/operations/list-fleet-drivers-by-organization-id.types"
import type { AppResultAsync } from "@/shared/types/app-result.types"

const prefixLog = "[listFleetDriversByOrganizationIdService]:"

const FALLBACK_ERROR = {
	success: false,
	code: "generic_error"
} as const

export async function listFleetDriversByOrganizationIdService(params: { organizationId: string }): AppResultAsync<ListFleetDriversByOrganizationIdServiceData, "generic_error"> {
	try {
		const { data, error } = await listDriversWithMemberAndOriginApplicationByOrganizationIdAdminRepo(params)

		if (error) {
			console.error(`${prefixLog} database error`, {
				code: error.code,
				details: error.details,
				hint: error.hint
			})
			return FALLBACK_ERROR
		}

		const drivers: ListFleetDriversByOrganizationIdServiceData["drivers"] = []

		for (const driver of data) {
			if (!driver.member) {
				console.error(`${prefixLog} consistency error: driver has no related user`, {
					driverId: driver.id
				})
				return FALLBACK_ERROR
			}

			if (!driver.origin_application?.reviewed_at) {
				console.error(`${prefixLog} consistency error: driver has no approval date`, {
					driverId: driver.id
				})
				return FALLBACK_ERROR
			}

			drivers.push({
				...driver,
				member: driver.member,
				origin_application: {
					reviewed_at: driver.origin_application.reviewed_at
				}
			})
		}

		return {
			success: true,
			data: {
				drivers
			}
		}
	} catch (error) {
		console.error(`${prefixLog} unexpected error:`, error)
		return FALLBACK_ERROR
	}
}

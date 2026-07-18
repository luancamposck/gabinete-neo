import { findOrganizationWithMemberhipAdminRepo } from "@/modules/organizations/server/repos/find-organization-with-membership.admin.repo"
import type { OrganizationWithMembershipView } from "@/modules/organizations/shared/types/views"
import type { OperationResponse } from "@/shared/types/operation-response.types"

const GENERIC_ERROR = "Não foi possível obter a organização. Tente novamente mais tarde."
const NOT_FOUND_MESSAGE = "Organização não encontrada."
const SUCCESS_MESSAGE = "Organização encontrada com sucesso."
const prefixLog = "[getOrganizationWithMemberhipService]:"

type CodeList = "org_not_found" | "infra_error"

type GetUserWithProfileServiceParams = {
	userId: string
	organizationId: string
}

type GetUserWithProfileServiceRes = {
	organizationWithMembership: OrganizationWithMembershipView
}

export async function getOrganizationWithMemberhipService(params: GetUserWithProfileServiceParams): OperationResponse<GetUserWithProfileServiceRes, CodeList> {
	const { organizationId, userId } = params

	try {
		const { data, error } = await findOrganizationWithMemberhipAdminRepo({ userId, organizationId })
		if (error) {
			console.error(`${prefixLog} ${error.message}`)
			return { success: false, message: GENERIC_ERROR }
		}

		if (!data) {
			return {
				success: false,
				message: NOT_FOUND_MESSAGE,
				code: "org_not_found"
			}
		}

		const membership = data.memberships[0]
		const organizationWithMembership = {
			...data,
			memberships: membership
		}

		return {
			success: true,
			message: SUCCESS_MESSAGE,
			data: { organizationWithMembership }
		}
	} catch (error) {
		console.error(`${prefixLog} unexpected error:`, error)
		return {
			success: false,
			message: GENERIC_ERROR,
			code: "infra_error"
		}
	}
}

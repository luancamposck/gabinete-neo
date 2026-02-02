// @/modules/organizations/server/services/get-organization-by-id.service.ts

import { findOrganizationByIdAdminRepo } from "@/modules/organizations/server/repos/find-organization-by-id.admin.repo"
import type { OperationResponse } from "@/shared/types/operation-reponse.types"
import type { OrganizationsRow } from "@/types/domain/organization/organization-base.types"

const GENERIC_ORG_LOOKUP_ERROR = "Não foi possível localizar a constelação. Tente novamente mais tarde."
const ORG_LOOKUP_SUCCESS = "Constelação encontrada com sucesso."
const prefixLog = "[getOrganizationByIdService]:"

export async function getOrganizationByIdService({ organizationId }: { organizationId: string }): OperationResponse<{ organization: OrganizationsRow }, "org_not_found" | "infra_error"> {
	try {
		const { data, error } = await findOrganizationByIdAdminRepo({ organizationId })

		if (error) {
			console.error(`${prefixLog} ${error.message}`)
			return {
				success: false,
				message: GENERIC_ORG_LOOKUP_ERROR,
				code: "infra_error"
			}
		}

		if (!data) {
			console.error(`${prefixLog} organization not found for id=${organizationId}`)
			return {
				success: false,
				message: GENERIC_ORG_LOOKUP_ERROR,
				code: "org_not_found"
			}
		}

		return {
			success: true,
			message: ORG_LOOKUP_SUCCESS,
			data: {
				organization: data
			}
		}
	} catch (error) {
		console.error(`${prefixLog} unexpected error:`, error)
		return {
			success: false,
			message: GENERIC_ORG_LOOKUP_ERROR,
			code: "infra_error"
		}
	}
}

// @/modules/organizations/server/services/get-organization-id-by-app-domain.service.ts

import { findOrganizationIdByAppDomainAdminRepo } from "@/modules/organizations/server/repos/find-organization-id-by-app-domain.admin.repo"
import type { OperationResponse } from "@/shared/types/operation-reponse.types"

const GENERIC_ORG_LOOKUP_ERROR = "Não foi possível localizar a constelação. Tente novamente mais tarde."
const ORG_LOOKUP_SUCCESS = "Constelação encontrada com sucesso."
const prefixLog = "[getOrganizationIdByAppDomainService]:"

export async function getOrganizationIdByAppDomainService({ appDomain }: { appDomain: string }): OperationResponse<{ organizationId: string }, "org_not_found" | "infra_error"> {
	try {
		const { data, error } = await findOrganizationIdByAppDomainAdminRepo({ appDomain })

		if (error) {
			console.error(`${prefixLog} ${error.message}`)
			return {
				success: false,
				message: GENERIC_ORG_LOOKUP_ERROR,
				code: "infra_error"
			}
		}

		const organizationId = data?.id

		if (!organizationId) {
			console.error(`${prefixLog} missing organization id after lookup`)
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
				organizationId: organizationId
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

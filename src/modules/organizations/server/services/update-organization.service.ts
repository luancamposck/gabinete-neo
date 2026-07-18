// @/modules/organizations/server/services/update-organization.service.ts

import { updateOrganizationAdminRepo } from "@/modules/organizations/server/repos/update-organization.admin.repo"
import type { OrganizationUpdateView, OrganizationView } from "@/modules/organizations/shared/types/views"
import type { OperationResponse } from "@/shared/types/operation-response.types"

const GENERIC_UPDATE_ERROR = "Não foi possível atualizar a constelação. Tente novamente mais tarde."
const UPDATE_SUCCESS = "Constelação atualizada com sucesso."
const prefixLog = "[updateOrganizationService]:"

type UpdateOrganizationParams = {
	organizationId: string
	updates: OrganizationUpdateView
}

type ErrorCodes = "infra_error"

export async function updateOrganizationService(params: UpdateOrganizationParams): OperationResponse<{ organization: OrganizationView }, ErrorCodes> {
	try {
		const { data: organization, error } = await updateOrganizationAdminRepo(params)

		if (error) {
			console.error(`${prefixLog} ${error.message}`)
			return {
				success: false,
				message: GENERIC_UPDATE_ERROR,
				code: "infra_error"
			}
		}

		return {
			success: true,
			message: UPDATE_SUCCESS,
			data: {
				organization
			}
		}
	} catch (error) {
		console.error(`${prefixLog} unexpected error:`, error)
		return {
			success: false,
			message: GENERIC_UPDATE_ERROR,
			code: "infra_error"
		}
	}
}

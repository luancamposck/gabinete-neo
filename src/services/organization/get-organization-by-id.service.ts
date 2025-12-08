import { getOrganizationByOrganizationIdAdminRepo } from "@/repositories/organizations/organizations.admin.repo"
import type { OrganizationsRow } from "@/types/domain/organization/organization-base.types"
import type { OperationResponse } from "@/types/operation-response"

export default async function getOrganizationByIdService({ organizationId }: { organizationId: string }): Promise<OperationResponse<{ organization: OrganizationsRow }>> {
	const { data: organizationData, error: organizationError } = await getOrganizationByOrganizationIdAdminRepo({ organizationId })

	if (organizationError) {
		console.error(`[getOrganizationByIdService]: ${organizationError.message}`)

		return {
			success: false,
			message: "Não foi possível buscar dados da organização."
		}
	}

	if (!organizationData) {
		return {
			success: false,
			message: "Não foi possível buscar dados da organização."
		}
	}

	return {
		success: true,
		message: "Dados da organização buscados com sucesso!",
		data: {
			organization: organizationData
		}
	}
}

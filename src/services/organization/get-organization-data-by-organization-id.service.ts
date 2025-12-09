import { getOrganizationByOrganizationIdAdminRepo } from "@/repositories/organizations/organizations.admin.repo"
import type { OrganizationsRow } from "@/types/domain/organization/organization-base.types"
import type { OperationResponse } from "@/types/operation-response"

export default async function getOrganizationDataByOrganizationIdService({ organizationId }: { organizationId: string }): Promise<OperationResponse<{ organization: OrganizationsRow }>> {
	const { data: organizationData, error: organizationError } = await getOrganizationByOrganizationIdAdminRepo({ organizationId })

	if (organizationError || !organizationData) {
		console.error("[getOrganizationDataByOrganizationIdService] Não foi possível buscar dados da organização:", organizationError?.message)

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

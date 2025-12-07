import { findOrganizationBySlugAdminRepo } from "@/repositories/organizations/organizations.admin.repo"
import type { OrganizationsRow } from "@/types/domain/organization/organization-base.types"
import type { OperationResponse } from "@/types/operation-response"

export async function findOrganizationBySlugService({ organizationSlug }: { organizationSlug: string }): Promise<OperationResponse<{ organization: OrganizationsRow | null }>> {
	try {
		const { data: organizationData, error: organizationError } = await findOrganizationBySlugAdminRepo({ organizationSlug })

		if (organizationError) {
			console.error(`[findOrganizationBySlugService]: ${organizationError.message}`)
			return {
				success: false,
				message: "Erro ao obter a organização pelo slug."
			}
		}

		return {
			success: true,
			message: "Organização obtida com sucesso.",
			data: {
				organization: organizationData
			}
		}
	} catch (err) {
		console.error("[findOrganizationBySlugService]: Unexpected error", err)

		return {
			success: false,
			message: "Erro inesperado ao obter a organização pelo slug."
		}
	}
}

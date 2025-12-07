import { findOrganizationMembershipByUserAndOrganizationAdminRepo } from "@/repositories/organization-menberships/organization-menberships.admin.repo"
import type { OrganizationMembershipsRow } from "@/types/domain/organization/organization-memberships-base.types"
import type { OperationResponse } from "@/types/operation-response"

export async function findOrganizationMembershipByUserAndOrganizationService({
	userId,
	organizationId
}: {
	userId: string
	organizationId: string
}): Promise<OperationResponse<{ organizationMembership: OrganizationMembershipsRow | null }>> {
	try {
		const { data, error } = await findOrganizationMembershipByUserAndOrganizationAdminRepo({ userId, organizationId })

		if (error) {
			console.error("[findOrganizationMembershipByUserAndOrganizationService]:", error.message)

			return {
				success: false,
				message: "Erro ao buscar membro da constelação."
			}
		}

		// 👇 aqui é a parte importante:
		return {
			success: true,
			message: "Membro da constelação encontrado (ou não).",
			data: {
				organizationMembership: data
			}
		}
	} catch (err) {
		console.error("[findOrganizationMembershipByUserAndOrganizationService]: Unexpected error", err)

		return {
			success: false,
			message: "Erro inesperado ao buscar membro da constelação."
		}
	}
}

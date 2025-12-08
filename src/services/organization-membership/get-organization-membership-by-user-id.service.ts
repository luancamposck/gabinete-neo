import { findOrganizationMembershipByUserIdAdminRepo } from "@/repositories/organization-menberships/organization-menberships.admin.repo"
import type { OrganizationMembershipsRow } from "@/types/domain/organization/organization-memberships-base.types"
import type { OperationResponse } from "@/types/operation-response"

export async function getOrganizationMembershipByUserIdService({ userId }: { userId: string }): Promise<OperationResponse<{ organizationMemberships: OrganizationMembershipsRow }>> {
	try {
		const { data: organizationMembershipData, error: organizationMembershipError } = await findOrganizationMembershipByUserIdAdminRepo({ userId })

		if (organizationMembershipError) {
			console.error(`[findOrganizationMembershipByUserIdService]: ${organizationMembershipError.message}`)
			return {
				success: false,
				message: "Erro ao obter membros da organização."
			}
		}

		if (!organizationMembershipData) {
			return {
				success: false,
				message: "Esse user não é membro de nenhuma organização."
			}
		}

		return {
			success: true,
			message: "Membros da organização obtidos com sucesso.",
			data: {
				organizationMemberships: organizationMembershipData
			}
		}
	} catch (err) {
		console.error("[findOrganizationMembershipByUserIdService]: Unexpected error", err)

		return {
			success: false,
			message: "Erro inesperado ao obter membros da organização."
		}
	}
}

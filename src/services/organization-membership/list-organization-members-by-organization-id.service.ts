// src/services/organization-membership/list-organization-members-by-organization-id.service.ts

import { listOrganizationMembersByOrganizationIdRepo } from "@/repositories/organization-menberships/organization-menberships.repo"
import type { OrganizationMemberWithUserProfile } from "@/types/domain/organization/organization-members-with-user-profile.types"
import type { OperationResponse } from "@/types/operation-response"

export async function listOrganizationMembersByOrganizationIdService({ organizationId }: { organizationId: string }): Promise<OperationResponse<{ organizationMembers: OrganizationMemberWithUserProfile[] }>> {
	try {
		const { data: organizationMembersData, error: organizationMembersError } = await listOrganizationMembersByOrganizationIdRepo({ organizationId })

		if (organizationMembersError) {
			console.error(`[listOrganizationMembersByOrganizationIdService]: ${organizationMembersError.message}`)

			return {
				success: false,
				message: "Erro ao obter membros da constelação."
			}
		}

		return {
			success: true,
			message: "Membros da constelação obtidos com sucesso.",
			data: {
				organizationMembers: organizationMembersData ?? []
			}
		}
	} catch (err) {
		console.error("[listOrganizationMembersByOrganizationIdService]: Unexpected error", err)

		return {
			success: false,
			message: "Erro inesperado ao obter membros da constelação."
		}
	}
}

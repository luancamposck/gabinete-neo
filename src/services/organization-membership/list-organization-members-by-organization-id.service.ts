// src/services/organization-membership/list-organization-memberships-with-user-by-organization-id.service.ts

import { listOrganizationMembersByOrganizationIdRepo } from "@/repositories/organization-menberships/organization-menberships.repo"
import type { OrganizationMemberWithUser } from "@/types/domain/organization/organization-member.types"
import type { OperationResponse } from "@/types/operation-response"

export async function listOrganizationMembersByOrganizationIdService({ organizationId }: { organizationId: string }): Promise<OperationResponse<{ members: OrganizationMemberWithUser[] }>> {
	try {
		const { data, error } = await listOrganizationMembersByOrganizationIdRepo({ organizationId })

		if (error) {
			console.error("[listOrganizationMembersByOrganizationIdService]:", error.message)

			return {
				success: false,
				message: "Erro ao obter membros da constelação."
			}
		}

		return {
			success: true,
			message: "Membros da constelação obtidos com sucesso.",
			data: {
				members: data ?? []
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

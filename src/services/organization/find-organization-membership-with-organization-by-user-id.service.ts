// src/services/organization/find-organization-membership-with-organization-by-user-id.service.ts

import { findOrganizationMembershipWithOrganizationByUserIdRepo } from "@/repositories/organizations/organizations.repo"
import type { OperationResponse } from "@/types/operation-response"

interface OrganizationMembershipWithOrganization {
	organization_id: string
	user_id: string
	role_id: string
	is_active: boolean
	created_at: string
	invited_by_user_id: string | null
	organization: {
		id: string
		name: string
		slug: string
		created_at: string
	} | null
}

export async function findOrganizationMembershipWithOrganizationByUserIdService({ userId }: { userId: string }): Promise<OperationResponse<{ membership: OrganizationMembershipWithOrganization | null }>> {
	try {
		const { data, error } = await findOrganizationMembershipWithOrganizationByUserIdRepo({ userId })

		if (error) {
			console.error("[findOrganizationMembershipWithOrganizationByUserIdService]:", error.message)

			return {
				success: false,
				message: "Erro ao buscar constelação do usuário."
			}
		}

		// pode não existir membership ativo -> data === null
		return {
			success: true,
			message: "Constelação do usuário obtida com sucesso.",
			data: {
				membership: data
			}
		}
	} catch (err) {
		console.error("[findOrganizationMembershipWithOrganizationByUserIdService]: Unexpected error", err)

		return {
			success: false,
			message: "Erro inesperado ao buscar constelação do usuário."
		}
	}
}

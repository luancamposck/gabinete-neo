// src/services/list-organization-invites.service.ts

import { listOrganizationInvitesWithRequestedUserByOrgRepo } from "@/repositories/organization-invites/organization-invites.repo"
import type { OperationResponse } from "@/types/operation-response"
import type { OrganizationInviteWithRequestedUser } from "@/types/organization-invite"

interface ListOrganizationInvitesServiceInput {
	organizationId: string
	status?: OrganizationInviteWithRequestedUser["status"]
}

type ListOrganizationInvitesServiceOutput = OperationResponse<{
	invites: OrganizationInviteWithRequestedUser[]
}>

export async function listOrganizationInvitesService(params: ListOrganizationInvitesServiceInput): Promise<ListOrganizationInvitesServiceOutput> {
	const { organizationId, status } = params

	const { data, error } = await listOrganizationInvitesWithRequestedUserByOrgRepo({
		organizationId,
		status
	})

	if (error) {
		console.error("[listOrganizationInvitesService] erro ao buscar invites:", error)

		return {
			success: false,
			message: "Não foi possível carregar os convites da organização."
		}
	}

	return {
		success: true,
		message: "Convites carregados com sucesso.",
		data: {
			invites: data ?? []
		}
	}
}

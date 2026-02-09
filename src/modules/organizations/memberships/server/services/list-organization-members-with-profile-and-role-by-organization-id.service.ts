// @/modules/organizations/memberships/server/services/list-organization-members-with-profile-and-role-by-organization-id.service.ts

import {
	listOrganizationMembersWithProfileAndRoleByOrganizationIdRepo,
	type OrganizationMemberWithUserProfileAndRole
} from "@/modules/organizations/memberships/server/repos/list-organization-members-with-profile-and-role-by-organization-id.repo"
import type { OperationResponse } from "@/shared/types/operation-reponse.types"

const GENERIC_ERROR = "Não foi possível obter os membros da organização. Tente novamente mais tarde."
const OK_MESSAGE = "Membros obtidos com sucesso."
const prefixLog = "[listOrganizationMembersWithProfileAndRoleByOrganizationIdService]:"

export async function listOrganizationMembersWithProfileAndRoleByOrganizationIdService(params: { organizationId: string }): OperationResponse<{organizationMembers: OrganizationMemberWithUserProfileAndRole[]}> {
	try {
		const { data, error } = await listOrganizationMembersWithProfileAndRoleByOrganizationIdRepo(params)

		if (error) {
			console.error(`${prefixLog} ${error.message}`)
			return {
				success: false,
				message: GENERIC_ERROR
			}
		}

		return {
			success: true,
			message: OK_MESSAGE,
			data: {
				organizationMembers: data ?? []
			}
		}
	} catch (error) {
		console.error(`${prefixLog} unexpected error:`, error)
		return {
			success: false,
			message: GENERIC_ERROR
		}
	}
}

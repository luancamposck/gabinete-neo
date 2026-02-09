// @/modules/organizations/memberships/server/slices/get-organization-members-for-table/actions/get-organization-members-for-table.action.ts
"use server"

import { getOrganizationMembersForTableUseCase } from "@/modules/organizations/memberships/server/slices/get-organization-members-for-table/use-cases/get-organization-members-for-table.use-case"
import type { OrganizationMemberTableRow } from "@/modules/organizations/memberships/shared/types/organization-members-table.types"
import type { OperationResponse } from "@/shared/types/operation-reponse.types"

type ErrorCodes = "org_not_found" | "infra_error"

export async function getOrganizationMembersForTableAction(): OperationResponse<{ members: OrganizationMemberTableRow[] }, ErrorCodes> {
	const useCaseRes = await getOrganizationMembersForTableUseCase()

	if (useCaseRes.success === false) {
		return {
			success: false,
			message: useCaseRes.message,
			code: useCaseRes.code
		}
	}

	const members: OrganizationMemberTableRow[] = useCaseRes.data.organizationMembers.map((member) => ({
		organizationId: member.organization_id,
		role: {
			id: member.role.id,
			name: member.role.name,
			isActive: member.role.is_active,
			isSystem: member.role.is_system
		},
		isActive: member.is_active,
		joinedAt: member.created_at,
		invitedByUserName: member.invited_by_user?.name ?? null,
		user: {
			id: member.user.id,
			name: member.user.name,
			email: member.user.email,
			phone: member.user.profile.phone,
			createdAt: member.user.created_at,
			address: {
				cep: member.user.profile.cep,
				street: member.user.profile.street,
				number: member.user.profile.number,
				complement: member.user.profile.complement,
				neighborhood: member.user.profile.neighborhood,
				city: member.user.profile.city,
				state: member.user.profile.state
			}
		}
	}))

	return {
		success: true,
		message: useCaseRes.message,
		data: {
			members
		}
	}
}

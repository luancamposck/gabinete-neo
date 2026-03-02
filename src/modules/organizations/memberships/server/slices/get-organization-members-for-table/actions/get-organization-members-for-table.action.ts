// @/modules/organizations/memberships/server/slices/get-organization-members-for-table/actions/get-organization-members-for-table.action.ts
"use server"

import type { PermissionKey } from "@/modules/auth/shared/permissions"
import { getOrganizationMembersForTableUseCase } from "@/modules/organizations/memberships/server/slices/get-organization-members-for-table/use-cases/get-organization-members-for-table.use-case"
import type { OrganizationMemberTableRow, OrganizationRoleOption } from "@/modules/organizations/memberships/shared/types/organization-members-table.types"
import type { OperationResponse } from "@/shared/types/operation-response.types"

type ErrorCodes = "unauthenticated" | "org_not_found" | "infra_error"

export async function getOrganizationMembersForTableAction(): OperationResponse<{ members: OrganizationMemberTableRow[]; permissionsKeys: PermissionKey[]; roles: OrganizationRoleOption[] }, ErrorCodes> {
	const useCaseRes = await getOrganizationMembersForTableUseCase()

	if (useCaseRes.success === false) {
		return {
			success: false,
			message: useCaseRes.message,
			code: useCaseRes.code
		}
	}

	const referralByInvitedUserId = new Map(useCaseRes.data.organizationReferrals.map((referral) => [referral.invited_user_id, referral] as const))

	const members: OrganizationMemberTableRow[] = useCaseRes.data.organizationMembers.map((member) => {
		const referral = referralByInvitedUserId.get(member.user.id)

		return {
			organizationId: member.organization_id,
			role: {
				id: member.role.id,
				name: member.role.name,
				isActive: member.role.is_active,
				isSystem: member.role.is_system
			},
			isActive: member.is_active,
			joinedAt: member.created_at,
			invitedByUserName: referral?.inviter_user?.name ?? member.invited_by_user?.name ?? null,
			relationshipToInviter: referral?.relationship_to_inviter ?? null,
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
		}
	})

	const { permissionsKeys } = useCaseRes.data

	const roles: OrganizationRoleOption[] = useCaseRes.data.roles.map((role) => ({
		id: role.id,
		name: role.name,
		isActive: role.is_active,
		isSystem: role.is_system
	}))

	return {
		success: true,
		message: useCaseRes.message,
		data: {
			members,
			permissionsKeys,
			roles
		}
	}
}

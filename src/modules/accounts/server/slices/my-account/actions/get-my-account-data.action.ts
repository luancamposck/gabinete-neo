"use server"

import { getMyAccountDataUseCase } from "@/modules/accounts/server/slices/my-account/use-cases/get-my-account-data.use-case"
import type { UserWithProfileDTO } from "@/modules/accounts/users/shared/types/dto"
import type { OrganizationWithMembershipDTO } from "@/modules/organizations/shared/types/dto"
import type { OperationResponse } from "@/shared/types/operation-response.types"

type CodeList = "unauthenticated" | "infra_error" | "user_not_found" | "org_not_found"

type GetMyAccountDataActiones = OperationResponse<
	{
		user: UserWithProfileDTO
		organization: OrganizationWithMembershipDTO
	},
	CodeList
>

export async function getMyAccountDataAction(): GetMyAccountDataActiones {
	const getAccountRes = await getMyAccountDataUseCase()
	if (getAccountRes.success === false) return getAccountRes

	const { userWithProfile, organizationWithMembership } = getAccountRes.data

	const user: UserWithProfileDTO = {
		id: userWithProfile.id,
		name: userWithProfile.name,
		username: userWithProfile.username,

		email: userWithProfile.email,
		phone: userWithProfile.user_profiles.phone,

		createdAt: userWithProfile.created_at,
		updatedAt: userWithProfile.updated_at,

		address: {
			cep: userWithProfile.user_profiles.cep,
			city: userWithProfile.user_profiles.city,
			complement: userWithProfile.user_profiles.complement,
			neighborhood: userWithProfile.user_profiles.neighborhood,
			number: userWithProfile.user_profiles.number,
			state: userWithProfile.user_profiles.state,
			street: userWithProfile.user_profiles.street
		}
	}

	const organization: OrganizationWithMembershipDTO = {
		id: organizationWithMembership.id,
		appDomain: organizationWithMembership.app_domain,
		name: organizationWithMembership.name,

		createdAt: organizationWithMembership.created_at,
		isActive: organizationWithMembership.is_active,

		membership: {
			createdAt: organizationWithMembership.memberships.created_at,
			invitedByUserId: organizationWithMembership.memberships.invited_by_user_id,
			role: "MEMBRO",
			isActive: organizationWithMembership.memberships.is_active
		}
	}

	return {
		success: true,
		message: getAccountRes.message,
		data: { user, organization }
	}
}

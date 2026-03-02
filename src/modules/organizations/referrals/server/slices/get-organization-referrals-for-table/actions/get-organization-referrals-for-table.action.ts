"use server"

import { getOrganizationReferralsForTableUseCase } from "@/modules/organizations/referrals/server/slices/get-organization-referrals-for-table/use-cases/get-organization-referrals-for-table.use-case"
import type { OrganizationReferralTableRow } from "@/modules/organizations/referrals/shared/types/organization-referrals-table.types"
import type { OperationResponse } from "@/shared/types/operation-response.types"

type ErrorCodes = "unauthenticated" | "org_not_found" | "not_member" | "infra_error"

type GetOrganizationReferralsForTableActionRes = {
	referrals: OrganizationReferralTableRow[]
}

export async function getOrganizationReferralsForTableAction(): OperationResponse<GetOrganizationReferralsForTableActionRes, ErrorCodes> {
	const useCaseRes = await getOrganizationReferralsForTableUseCase()

	if (useCaseRes.success === false) {
		return {
			success: false,
			message: useCaseRes.message,
			code: useCaseRes.code
		}
	}

	const referrals: OrganizationReferralTableRow[] = useCaseRes.data.organizationReferrals.map((referral) => ({
		id: referral.id,
		organizationId: referral.organization_id,
		inviterUserId: referral.inviter_user_id,
		inviterUserName: referral.inviter_user?.name ?? null,
		inviterUserEmail: referral.inviter_user?.email ?? null,
		invitedUserId: referral.invited_user_id,
		invitedUserName: referral.invited_user?.name ?? null,
		invitedUserEmail: referral.invited_user?.email ?? null,
		relationshipToInviter: referral.relationship_to_inviter ?? null,
		createdAt: referral.created_at
	}))

	return {
		success: true,
		message: useCaseRes.message,
		data: {
			referrals
		}
	}
}

// @/modules/organizations/referrals/shared/types/inputs.ts

export type CreateOrganizationReferralParams = {
	organizationId: string
	inviterUserId: string
	invitedUserId: string
	relationshipToInviter?: string | null
}

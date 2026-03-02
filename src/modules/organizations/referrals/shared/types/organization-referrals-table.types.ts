export type OrganizationReferralTableRow = {
	id: string
	organizationId: string
	inviterUserId: string
	inviterUserName: string | null
	inviterUserEmail: string | null
	invitedUserId: string
	invitedUserName: string | null
	invitedUserEmail: string | null
	relationshipToInviter: string | null
	createdAt: string
}

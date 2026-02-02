export type OrganizationWithMembershipDTO = {
	id: string
	appDomain: string
	name: string
	slug: string

	createdAt: string
	isActive: boolean

	membership: {
		createdAt: string
		invitedByUserId: string | null
		role: string
		isActive: boolean
	}
}

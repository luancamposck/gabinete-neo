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

export type OrganizationDTO = {
	id: string
	name: string
	description: string | null
	slug: string
	appDomain: string
	imageUrl: string | null

	isActive: boolean
	createdAt: string
	updatedAt: string
	createdByUserId: string | null
}

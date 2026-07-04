export type OrganizationWithMembershipDTO = {
	id: string
	appDomain: string
	name: string

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
	appDomain: string
	imageUrl: string | null

	isActive: boolean
	createdAt: string
	updatedAt: string
}

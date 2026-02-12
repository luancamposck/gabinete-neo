export type OrganizationUserTableAddress = {
	cep: string
	street: string
	number: string
	complement: string | null
	neighborhood: string
	city: string
	state: string
}

export type OrganizationUserTableUser = {
	id: string
	name: string
	email: string
	phone: string
	createdAt: string
	address: OrganizationUserTableAddress
}

export type OrganizationUserTableRole = {
	id: string
	name: string
	isActive: boolean
	isSystem: boolean
}

export type OrganizationUserTableRow = {
	organizationId: string
	role: OrganizationUserTableRole
	isActive: boolean
	joinedAt: string
	invitedByUserName: string | null
	relationshipToInviter: string | null
	user: OrganizationUserTableUser
}

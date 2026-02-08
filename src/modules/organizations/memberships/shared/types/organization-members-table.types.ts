export type OrganizationMemberTableAddress = {
	cep: string
	street: string
	number: string
	complement: string | null
	neighborhood: string
	city: string
	state: string
}

export type OrganizationMemberTableUser = {
	id: string
	name: string
	email: string
	phone: string
	address: OrganizationMemberTableAddress
}

export type OrganizationMemberTableRole = {
	id: string
	name: string
	isActive: boolean
	isSystem: boolean
}

export type OrganizationMemberTableRow = {
	organizationId: string
	userId: string
	role: OrganizationMemberTableRole
	isActive: boolean
	createdAt: string
	invitedByUserName: string | null
	user: OrganizationMemberTableUser
}

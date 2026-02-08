// src/types/dto/organization-member.dto.ts

export interface OrganizationMemberAddressDTO {
	cep: string
	street: string
	number: string
	complement: string | null
	neighborhood: string
	city: string
	state: string
}

export interface OrganizationMemberUserDTO {
	id: string
	name: string
	email: string
	phone: string
	address: OrganizationMemberAddressDTO
}

export interface OrganizationMemberDTO {
	organizationId: string
	userId: string
	role: string //"OWNER" | "ADMIN" | "MEMBER"
	isActive: boolean
	createdAt: string
	invitedByUserId: string | null
	user: OrganizationMemberUserDTO
}

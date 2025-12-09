// src/types/dto/organization-member.dto.ts

export interface OrganizationMemberAddressDTO {
	cep: string | null
	street: string | null
	number: string | null
	complement: string | null
	neighborhood: string | null
	city: string | null
	state: string | null
}

export interface OrganizationMemberUserDTO {
	id: string
	name: string | null
	email: string
	phone: string | null
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

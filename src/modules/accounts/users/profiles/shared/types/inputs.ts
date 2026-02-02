// @/modules/accounts/users/profiles/shared/types/inputs.ts
export type CreateUserProfileParams = {
	userId: string
	phone: string

	cep: string
	state: string
	city: string
	neighborhood: string
	street: string
	number: string
	complement?: string
}

export type UpdateUserAddressParams = {
	userId: string
	cep: string
	state: string
	city: string
	neighborhood: string
	street: string
	number: string
	complement?: string
}

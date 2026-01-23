// @/modules/accounts/onboarding/shared/types/inputs.ts
export type RegisterAndJoinParams = {
	email: string
	password: string

	name: string
	phone: string

	cep: string
	state: string
	city: string
	neighborhood: string
	street: string
	number: string
	complement?: string
}

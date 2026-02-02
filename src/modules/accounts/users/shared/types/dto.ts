export type UserWithProfileDTO = {
	id: string
	name: string
	username: string

	email: string
	phone: string

	createdAt: string
	updatedAt: string

	address: {
		cep: string
		city: string
		complement: string | null
		neighborhood: string
		number: string
		state: string
		street: string
	}
}

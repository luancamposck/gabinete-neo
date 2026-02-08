import type { UserRow } from "@/modules/accounts/users/shared/types/db"

export type UserWithProfileView = {
	created_at: string
	email: string
	id: string
	name: string
	updated_at: string
	username: string
	user_profiles: {
		cep: string
		city: string
		complement: string | null
		created_at: string
		neighborhood: string
		number: string
		phone: string
		state: string
		street: string
		updated_at: string
		user_id: string
	}
}

export type UserView = UserRow

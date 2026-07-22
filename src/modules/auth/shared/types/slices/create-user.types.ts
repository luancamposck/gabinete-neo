// ============= REPO =============

export interface CreateUserAdminRepoParams {
	email: string
	password: string
	name: string
	username: string

	phone: string
	cep: string
	street: string
	number: string
	complement?: string | null
	neighborhood: string
	city: string
	state: string
}

// ============= SERVICE =============

export interface CreateUserServiceParams {
	email: string
	password: string
	name: string
	username: string

	phone: string
	cep: string
	street: string
	number: string
	complement?: string | null
	neighborhood: string
	city: string
	state: string
}

export interface CreateUserServiceData {
	userId: string
}

export type CreateUserServiceCodes = "generic_error" | "email_exists" | "weak_password" | "rate_limit" | "signup_disabled"

// ============= ACTION =============

// No Actions here

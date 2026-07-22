// ============= USE-CASE =============

export interface RegisterAndJoinUseCaseParams {
	email: string
	password: string
	name: string
	username: string

	phone: string
	cep: string
	state: string
	city: string
	neighborhood: string
	street: string
	number: string
	complement?: string | null

	ref?: string
	relationshipToInviter?: string | null
}

export interface RegisterAndJoinUseCaseData {
	userId: string
	organizationId: string
}

export type RegisterAndJoinUseCaseCodes =
	| "generic_error"
	| "org_not_found"
	| "username_taken"
	| "phone_taken"
	| "email_exists"
	| "weak_password"
	| "rate_limit"
	| "signup_disabled"
	| "invalid_signup"
	| "role_not_found"
	| "role_inactive"

// ============= ACTION =============

export type RegisterAndJoinActionData = RegisterAndJoinUseCaseData

export type RegisterAndJoinActionCodes = RegisterAndJoinUseCaseCodes | "invalid_input"

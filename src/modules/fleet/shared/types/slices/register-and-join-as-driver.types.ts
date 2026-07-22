import type { VehicleType } from "../db"

// ============= USE-CASE =============

export interface RegisterAndJoinAsDriverUseCaseParams {
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
	plate: string
	vehicleType: VehicleType
	vehicleModel?: string | null
	vehicleYear?: number | null
	vehicleColor?: string | null
	crlv: File
	cnh: File
	ref?: string
	relationshipToInviter?: string | null
}

export interface RegisterAndJoinAsDriverUseCaseData {
	organizationId: string
	userId: string
	applicationId: string
}

export type RegisterAndJoinAsDriverUseCaseCodes =
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
	| "invalid_file"
	| "plate_taken"
	| "pending_application_exists"

// ============= ACTION =============

export type RegisterAndJoinAsDriverActionData = RegisterAndJoinAsDriverUseCaseData

export type RegisterAndJoinAsDriverActionCodes = RegisterAndJoinAsDriverUseCaseCodes | "invalid_input"

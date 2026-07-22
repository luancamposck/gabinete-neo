// ============= REPO =============

export interface SelectUserIdByEmailAdminRepoParams {
	email: string
}

// ============= SERVICE =============

export interface LookupUserIdByEmailServiceParams {
	email: string
}

export interface LookupUserIdByEmailServiceData {
	userId: string | null
}

export type LookupUserIdByEmailServiceCodes = "generic_error"

// ============= ACTION =============

// No Actions here

// ============= REPO =============

export interface SelectUserIdByUsernameAdminRepoParams {
	username: string
}

// ============= SERVICE =============

export interface CheckUsernameAvailableServiceParams {
	username: string
}

export type CheckUsernameAvailableServiceData = null

export type CheckUsernameAvailableServiceCodes = "generic_error" | "username_taken"

// ============= ACTION =============

// No Actions here

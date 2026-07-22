// ============= REPO =============

export interface SelectUserIdByPhoneAdminRepoParams {
	phone: string
}

// ============= SERVICE =============

export interface CheckPhoneAvailableServiceParams {
	phone: string
}

export type CheckPhoneAvailableServiceData = null

export type CheckPhoneAvailableServiceCodes = "generic_error" | "phone_taken"

// ============= ACTION =============

// No Actions here

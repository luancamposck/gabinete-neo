// ============= REPO =============

export interface SelectPendingDriverApplicationIdByOrganizationAndUserAdminRepoParams {
	organizationId: string
	userId: string
}

// ============= SERVICE =============

export interface CheckPendingDriverApplicationServiceParams {
	organizationId: string
	userId: string
}

export type CheckPendingDriverApplicationServiceData = null

export type CheckPendingDriverApplicationServiceCodes = "generic_error" | "pending_application_exists"

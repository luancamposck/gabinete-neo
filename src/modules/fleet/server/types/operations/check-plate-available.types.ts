// ============= REPO =============

export interface SelectDriverApplicationIdByOrganizationAndPlateAdminRepoParams {
	organizationId: string
	plate: string
}

// ============= SERVICE =============

export interface CheckPlateAvailableServiceParams {
	organizationId: string
	plate: string
}

export type CheckPlateAvailableServiceData = null

export type CheckPlateAvailableServiceCodes = "generic_error" | "plate_taken"

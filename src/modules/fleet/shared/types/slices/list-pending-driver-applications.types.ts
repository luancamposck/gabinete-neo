import type { VehicleType } from "../db"

// ============= REPO =============

export interface ListPendingDriverApplicationsAdminRepoParams {
	organizationId: string
}

// ============= SERVICE =============

export interface ListPendingDriverApplicationsServiceParams {
	organizationId: string
}

export interface ListPendingDriverApplicationsServiceData {
	applications: {
		id: string
		plate: string
		vehicle_type: VehicleType
		vehicle_model: string | null
		vehicle_year: number | null
		vehicle_color: string | null
		crlv_document_path: string
		cnh_document_path: string
		created_at: string
		candidate: {
			id: string
			name: string
			email: string
		} | null
	}[]
}

export type ListPendingDriverApplicationsServiceCodes = "generic_error"

// ============= ACTION =============

// No Actions here

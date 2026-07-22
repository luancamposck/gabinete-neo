import type { VehicleType } from "../db"

// ============= USE-CASE =============

export interface PendingDriverApplicationDTO {
	applicationId: string
	candidate: {
		id: string
		name: string
		email: string
	} | null
	plate: string
	vehicleType: VehicleType
	vehicleModel: string | null
	vehicleYear: number | null
	vehicleColor: string | null
	crlvSignedUrl: string | null
	cnhSignedUrl: string | null
	createdAt: string
}

export interface GetPendingDriverApplicationsUseCaseData {
	applications: PendingDriverApplicationDTO[]
}

export type GetPendingDriverApplicationsUseCaseCodes = "unauthenticated" | "org_not_found" | "not_allowed" | "generic_error"

// ============= ACTION =============

export type GetPendingDriverApplicationsActionData = GetPendingDriverApplicationsUseCaseData

export type GetPendingDriverApplicationsActionCodes = GetPendingDriverApplicationsUseCaseCodes

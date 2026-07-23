import type { VehicleType } from "@/modules/fleet/shared/types/db"

// ============= USE-CASE =============

export interface AddDriverApplicationUseCaseParams {
	candidateUserId: string
	plate: string
	vehicleType: VehicleType
	vehicleModel?: string | null
	vehicleYear?: number | null
	vehicleColor?: string | null
	crlv: File
	cnh: File
}

export interface AddDriverApplicationUseCaseData {
	applicationId: string
}

export type AddDriverApplicationUseCaseCodes = "unauthenticated" | "org_not_found" | "not_allowed" | "candidate_not_member" | "plate_taken" | "pending_application_exists" | "generic_error"

// ============= ACTION =============

export type AddDriverApplicationActionData = AddDriverApplicationUseCaseData

export type AddDriverApplicationActionCodes = AddDriverApplicationUseCaseCodes | "invalid_input"

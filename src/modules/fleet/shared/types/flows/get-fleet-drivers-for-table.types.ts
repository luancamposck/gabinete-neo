import type { VehicleType } from "@/modules/fleet/shared/types/db"

// ============= DTO =============

export interface FleetDriverForTableDTO {
	driverId: string
	plate: string
	vehicleType: VehicleType
	member: {
		id: string
		name: string
		email: string
	}
	approvedAt: string
	isActive: boolean
}

// ============= USE-CASE =============

export interface GetFleetDriversForTableUseCaseData {
	drivers: FleetDriverForTableDTO[]
}

export type GetFleetDriversForTableUseCaseCodes = "unauthenticated" | "org_not_found" | "not_allowed" | "generic_error"

// ============= ACTION =============

export type GetFleetDriversForTableActionData = GetFleetDriversForTableUseCaseData

export type GetFleetDriversForTableActionCodes = GetFleetDriversForTableUseCaseCodes

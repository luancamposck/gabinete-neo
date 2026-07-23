import type { VehicleType } from "@/modules/fleet/shared/types/db"

// ============= SERVICE =============

export interface ListFleetDriversByOrganizationIdServiceData {
	drivers: {
		id: string
		plate: string
		vehicle_type: VehicleType
		is_active: boolean
		created_at: string
		member: {
			id: string
			name: string
			email: string
		}
		origin_application: {
			reviewed_at: string
		}
	}[]
}

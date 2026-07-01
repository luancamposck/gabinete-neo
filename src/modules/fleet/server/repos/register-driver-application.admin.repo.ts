// @/modules/fleet/server/repos/register-driver-application.admin.repo.ts
import { createAdminClient } from "@/lib/supabase/admin"
import type { VehicleType } from "@/modules/fleet/shared/constants/vehicle-types"

type Params = {
	organizationId: string
	userId: string
	plate: string
	vehicleType: VehicleType
	vehicleModel?: string | null
	vehicleYear?: number | null
	vehicleColor?: string | null
	crlvPath: string
	cnhPath: string
	invitedByUserId?: string | null
}

/**
 * Espera existir a RPC transacional:
 * public.register_driver_application(...) -> { application_id, joined_now, error_code }
 */
export async function registerDriverApplicationAdminRepo(params: Params) {
	const supabaseAdmin = createAdminClient()

	return supabaseAdmin.rpc("register_driver_application", {
		p_organization_id: params.organizationId,
		p_user_id: params.userId,
		p_plate: params.plate,
		p_vehicle_type: params.vehicleType,
		p_vehicle_model: params.vehicleModel ?? null,
		p_vehicle_year: params.vehicleYear ?? null,
		p_vehicle_color: params.vehicleColor ?? null,
		p_crlv_path: params.crlvPath,
		p_cnh_path: params.cnhPath,
		p_invited_by_user_id: params.invitedByUserId ?? null
	})
}

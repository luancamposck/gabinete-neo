// @/modules/fleet/shared/constants/vehicle-type.ts

import type { VehicleType } from "@/modules/fleet/shared/types/db"
import { Constants } from "@/shared/types/supabase"

// ============================================================
// Tipos de veículo
//
// Valores derivados do enum public.driver_vehicle_type do banco
// (fonte única de verdade — regerar via `npm run db:gen-types`).
// O tipo VehicleType vive em ../types/db (derivado do Row).
// ============================================================
export const VEHICLE_TYPES = Constants.public.Enums.driver_vehicle_type

export const VEHICLE_TYPE_LABELS: Record<VehicleType, string> = {
	car: "Carro",
	motorcycle: "Moto",
	van: "Van",
	truck: "Caminhão"
}

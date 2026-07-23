import type { Enums } from "@/shared/types/supabase"

// ============= SERVICE =============

export type GetDriverApplicationByIdServiceData = {
	id: string
	organization_id: string
	status: Enums<"driver_application_status">
}

export type GetDriverApplicationByIdServiceCodes = "not_found" | "generic_error"

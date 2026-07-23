import type { DriverApplicationInsert, VehicleType } from "@/modules/fleet/shared/types/db"

export type InsertDriverApplicationAdminRepoParams = Pick<
	DriverApplicationInsert,
	"organization_id" | "user_id" | "plate" | "vehicle_type" | "vehicle_model" | "vehicle_year" | "vehicle_color" | "crlv_document_path" | "cnh_document_path"
>

export interface CreateDriverApplicationServiceParams {
	organizationId: string
	userId: string
	plate: string
	vehicleType: VehicleType
	vehicleModel?: string | null
	vehicleYear?: number | null
	vehicleColor?: string | null
	crlvDocumentPath: string
	cnhDocumentPath: string
}

export interface CreateDriverApplicationServiceData {
	applicationId: string
}

export type CreateDriverApplicationServiceCodes = "generic_error"

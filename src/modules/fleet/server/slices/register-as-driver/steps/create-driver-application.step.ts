// @/modules/fleet/server/slices/register-as-driver/steps/create-driver-application.step.ts

import { registerDriverApplicationService } from "@/modules/fleet/server/services/register-driver-application.service"
import type { VehicleType } from "@/modules/fleet/shared/constants/vehicle-types"
import type { OperationResponse } from "@/shared/types/operation-response.types"

type CreateDriverApplicationStepParams = {
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

type CreateDriverApplicationStepRes = {
	applicationId: string
	joinedNow: boolean
}

type ErrorCodes = "plate_taken" | "application_pending_exists" | "infra_error"

export async function createDriverApplicationStep(params: CreateDriverApplicationStepParams): OperationResponse<CreateDriverApplicationStepRes, ErrorCodes> {
	return registerDriverApplicationService({
		organizationId: params.organizationId,
		userId: params.userId,
		plate: params.plate,
		vehicleType: params.vehicleType,
		vehicleModel: params.vehicleModel ?? null,
		vehicleYear: params.vehicleYear ?? null,
		vehicleColor: params.vehicleColor ?? null,
		crlvPath: params.crlvPath,
		cnhPath: params.cnhPath,
		invitedByUserId: params.invitedByUserId ?? null
	})
}

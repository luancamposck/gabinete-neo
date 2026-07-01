// @/modules/fleet/server/slices/register-as-driver/steps/upload-driver-documents.step.ts

import { uploadDriverDocumentsService } from "@/modules/fleet/server/services/upload-driver-documents.service"
import type { OperationResponse } from "@/shared/types/operation-response.types"

type UploadDriverDocumentsStepParams = {
	organizationId: string
	userId: string
	crlv: File
	cnh: File
}

type UploadDriverDocumentsStepRes = {
	crlvPath: string
	cnhPath: string
}

type ErrorCodes = "invalid_file" | "infra_error"

export async function uploadDriverDocumentsStep(params: UploadDriverDocumentsStepParams): OperationResponse<UploadDriverDocumentsStepRes, ErrorCodes> {
	return uploadDriverDocumentsService({
		organizationId: params.organizationId,
		userId: params.userId,
		crlv: params.crlv,
		cnh: params.cnh
	})
}

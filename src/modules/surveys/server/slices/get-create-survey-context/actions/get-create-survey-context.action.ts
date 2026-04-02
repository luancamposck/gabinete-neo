"use server"

import { getCreateSurveyContextUseCase } from "@/modules/surveys/server/slices/get-create-survey-context/use-cases/get-create-survey-context.use-case"
import type { OperationResponse } from "@/shared/types/operation-response.types"

type GetCreateSurveyContextActionRes = {
	organization: {
		id: string
		name: string
	}
}

type ErrorCodes = "unauthenticated" | "org_not_found" | "not_allowed" | "infra_error"

export async function getCreateSurveyContextAction(): OperationResponse<GetCreateSurveyContextActionRes, ErrorCodes> {
	return getCreateSurveyContextUseCase()
}

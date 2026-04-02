"use server"

import { getManageSurveyContextUseCase } from "@/modules/surveys/server/slices/get-manage-survey-context/use-cases/get-manage-survey-context.use-case"
import type { SurveyDetailDTO } from "@/modules/surveys/shared/types/dto"
import { getManageSurveyContextActionSchema } from "@/modules/surveys/shared/validations/get-manage-survey-context.schema"
import type { OperationResponse } from "@/shared/types/operation-response.types"

type GetManageSurveyContextActionRes = {
	organization: {
		id: string
		name: string
	}
	survey: SurveyDetailDTO
	isStructureLocked: boolean
}

type GetManageSurveyContextActionCode = "invalid_input" | "unauthenticated" | "org_not_found" | "not_allowed" | "survey_not_found" | "infra_error"

export async function getManageSurveyContextAction(input: unknown): OperationResponse<GetManageSurveyContextActionRes, GetManageSurveyContextActionCode> {
	const parsed = getManageSurveyContextActionSchema.safeParse(input)
	if (!parsed.success) {
		return {
			success: false,
			message: "Dados inválidos para carregar a gestão da pesquisa.",
			code: "invalid_input"
		}
	}

	return getManageSurveyContextUseCase({
		surveyId: parsed.data.surveyId
	})
}

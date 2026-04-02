"use server"

import { loadPublicSurveyDetailUseCase } from "@/modules/surveys/server/slices/load-public-survey-detail/use-cases/load-public-survey-detail.use-case"
import type { SurveyPublicDetailDTO } from "@/modules/surveys/shared/types/dto"
import { loadPublicSurveyDetailActionSchema } from "@/modules/surveys/shared/validations/load-public-survey-detail.schema"
import type { OperationResponse } from "@/shared/types/operation-response.types"

type LoadPublicSurveyDetailActionRes = {
	survey: SurveyPublicDetailDTO
}

type LoadPublicSurveyDetailActionCode = "invalid_input" | "org_not_found" | "survey_not_found" | "survey_cross_tenant" | "survey_draft" | "survey_closed" | "survey_unavailable" | "infra_error"

export async function loadPublicSurveyDetailAction(input: unknown): OperationResponse<LoadPublicSurveyDetailActionRes, LoadPublicSurveyDetailActionCode> {
	const parsed = loadPublicSurveyDetailActionSchema.safeParse(input)
	if (!parsed.success) {
		return {
			success: false,
			message: "Dados inválidos para carregar a pesquisa pública.",
			code: "invalid_input"
		}
	}

	const res = await loadPublicSurveyDetailUseCase({
		surveyId: parsed.data.surveyId
	})

	if (res.success === false) {
		return res
	}

	return {
		success: true,
		message: res.message,
		data: {
			survey: res.data.survey
		}
	}
}

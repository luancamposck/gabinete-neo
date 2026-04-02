"use server"

import { loadDashboardSurveyDetailUseCase } from "@/modules/surveys/server/slices/load-dashboard-survey-detail/use-cases/load-dashboard-survey-detail.use-case"
import type { SurveyDetailDTO } from "@/modules/surveys/shared/types/dto"
import { loadDashboardSurveyDetailActionSchema } from "@/modules/surveys/shared/validations/load-dashboard-survey-detail.schema"
import type { OperationResponse } from "@/shared/types/operation-response.types"

type LoadDashboardSurveyDetailActionRes = {
	survey: SurveyDetailDTO
}

type LoadDashboardSurveyDetailActionCode = "invalid_input" | "unauthenticated" | "org_not_found" | "not_member" | "survey_not_found" | "infra_error"

export async function loadDashboardSurveyDetailAction(input: unknown): OperationResponse<LoadDashboardSurveyDetailActionRes, LoadDashboardSurveyDetailActionCode> {
	const parsed = loadDashboardSurveyDetailActionSchema.safeParse(input)
	if (!parsed.success) {
		return {
			success: false,
			message: "Dados inválidos para carregar a pesquisa do dashboard.",
			code: "invalid_input"
		}
	}

	const res = await loadDashboardSurveyDetailUseCase({
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

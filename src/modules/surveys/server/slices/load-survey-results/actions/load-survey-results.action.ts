"use server"

import { loadSurveyResultsUseCase } from "@/modules/surveys/server/slices/load-survey-results/use-cases/load-survey-results.use-case"
import type { SurveyResultsDTO } from "@/modules/surveys/shared/types/dto"
import { loadSurveyResultsActionSchema } from "@/modules/surveys/shared/validations/load-survey-results.schema"
import type { OperationResponse } from "@/shared/types/operation-response.types"

type LoadSurveyResultsActionRes = {
	results: SurveyResultsDTO
}

type LoadSurveyResultsActionCode = "invalid_input" | "unauthenticated" | "not_allowed" | "organization_not_found" | "survey_not_found" | "infra_error"

export async function loadSurveyResultsAction(input: unknown): OperationResponse<LoadSurveyResultsActionRes, LoadSurveyResultsActionCode> {
	const parsed = loadSurveyResultsActionSchema.safeParse(input)
	if (!parsed.success) {
		return {
			success: false,
			message: "Dados inválidos para carregar os resultados da pesquisa.",
			code: "invalid_input"
		}
	}

	const res = await loadSurveyResultsUseCase(parsed.data)
	if (res.success === false) {
		return res
	}

	return {
		success: true,
		message: res.message,
		data: {
			results: res.data.results
		}
	}
}

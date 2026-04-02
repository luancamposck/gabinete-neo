"use server"

import { publishSurveyUseCase } from "@/modules/surveys/server/slices/publish-survey/use-cases/publish-survey.use-case"
import { mapSurveyRowToSurveySummaryDTO, type SurveySummaryDTO } from "@/modules/surveys/shared/types/dto"
import { publishSurveyActionSchema } from "@/modules/surveys/shared/validations/publish-survey.schema"
import type { OperationResponse } from "@/shared/types/operation-response.types"

type ErrorCodes = "invalid_input" | "unauthenticated" | "not_allowed" | "organization_not_found" | "survey_not_found" | "invalid_publication_state" | "min_questions_required" | "infra_error"

export async function publishSurveyAction(input: unknown): OperationResponse<{ survey: SurveySummaryDTO }, ErrorCodes> {
	const parsed = publishSurveyActionSchema.safeParse(input)
	if (!parsed.success) {
		return {
			success: false,
			message: "Dados inválidos para publicação da pesquisa.",
			code: "invalid_input"
		}
	}

	const res = await publishSurveyUseCase(parsed.data)
	if (res.success === false) return res

	return {
		success: true,
		message: res.message,
		data: {
			survey: mapSurveyRowToSurveySummaryDTO(res.data.survey)
		}
	}
}

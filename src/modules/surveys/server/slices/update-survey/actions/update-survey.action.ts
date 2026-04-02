"use server"

import { updateSurveyUseCase } from "@/modules/surveys/server/slices/update-survey/use-cases/update-survey.use-case"
import { mapSurveyRowToSurveySummaryDTO, type SurveySummaryDTO } from "@/modules/surveys/shared/types/dto"
import { updateSurveyActionSchema } from "@/modules/surveys/shared/validations/update-survey.schema"
import type { OperationResponse } from "@/shared/types/operation-response.types"

type ErrorCodes = "invalid_input" | "unauthenticated" | "not_allowed" | "organization_not_found" | "survey_not_found" | "survey_locked_after_response" | "infra_error"

export async function updateSurveyAction(input: unknown): OperationResponse<{ survey: SurveySummaryDTO }, ErrorCodes> {
	const parsed = updateSurveyActionSchema.safeParse(input)
	if (!parsed.success) {
		return {
			success: false,
			message: "Dados inválidos para edição da pesquisa.",
			code: "invalid_input"
		}
	}

	const res = await updateSurveyUseCase({
		organizationId: parsed.data.organizationId,
		surveyId: parsed.data.surveyId,
		updates: {
			title: parsed.data.title,
			description: parsed.data.description,
			visibility: parsed.data.visibility,
			acceptAnonymousAnswers: parsed.data.acceptAnonymousAnswers,
			startsAt: parsed.data.startsAt,
			endsAt: parsed.data.endsAt,
			questions: parsed.data.questions
		}
	})

	if (res.success === false) return res

	return {
		success: true,
		message: res.message,
		data: {
			survey: mapSurveyRowToSurveySummaryDTO(res.data.survey)
		}
	}
}

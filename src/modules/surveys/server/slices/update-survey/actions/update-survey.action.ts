"use server"

import { updateSurveyUseCase } from "@/modules/surveys/server/slices/update-survey/use-cases/update-survey.use-case"
import type { SurveyRow } from "@/modules/surveys/shared/types/db"
import { updateSurveyActionSchema } from "@/modules/surveys/shared/validations/update-survey.schema"
import type { OperationResponse } from "@/shared/types/operation-response.types"

type ErrorCodes = "invalid_input" | "unauthenticated" | "not_allowed" | "organization_not_found" | "survey_not_found" | "infra_error"

export async function updateSurveyAction(input: unknown): OperationResponse<{ survey: SurveyRow }, ErrorCodes> {
	const parsed = updateSurveyActionSchema.safeParse(input)
	if (!parsed.success) {
		return {
			success: false,
			message: "Dados inválidos para edição da pesquisa.",
			code: "invalid_input"
		}
	}

	return updateSurveyUseCase({
		organizationId: parsed.data.organizationId,
		surveyId: parsed.data.surveyId,
		updates: {
			title: parsed.data.title,
			description: parsed.data.description,
			visibility: parsed.data.visibility,
			acceptAnonymousAnswers: parsed.data.acceptAnonymousAnswers,
			startsAt: parsed.data.startsAt,
			endsAt: parsed.data.endsAt
		}
	})
}

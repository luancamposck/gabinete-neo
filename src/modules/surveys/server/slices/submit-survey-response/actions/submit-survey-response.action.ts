"use server"

import { submitSurveyResponseUseCase } from "@/modules/surveys/server/slices/submit-survey-response/use-cases/submit-survey-response.use-case"
import type { SurveyResponseRow } from "@/modules/surveys/shared/types/db"
import { submitSurveyResponseActionSchema } from "@/modules/surveys/shared/validations/submit-survey-response.schema"
import type { OperationResponse } from "@/shared/types/operation-response.types"

type ErrorCodes = "invalid_input" | "already_answered" | "invalid_answers" | "infra_error"

export async function submitSurveyResponseAction(input: unknown): OperationResponse<{ response: SurveyResponseRow }, ErrorCodes> {
	const parsed = submitSurveyResponseActionSchema.safeParse(input)
	if (!parsed.success) {
		return {
			success: false,
			message: "Dados inválidos para registrar resposta da pesquisa.",
			code: "invalid_input"
		}
	}

	return submitSurveyResponseUseCase({
		surveyId: parsed.data.surveyId,
		organizationId: parsed.data.organizationId ?? null,
		isAnonymous: parsed.data.isAnonymous,
		respondentName: parsed.data.respondentName ?? null,
		respondentEmail: parsed.data.respondentEmail ?? null,
		respondentPhone: parsed.data.respondentPhone ?? null,
		answers: parsed.data.answers
	})
}

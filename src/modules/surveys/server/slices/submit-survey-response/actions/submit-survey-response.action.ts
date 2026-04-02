"use server"

import { submitSurveyResponseUseCase } from "@/modules/surveys/server/slices/submit-survey-response/use-cases/submit-survey-response.use-case"
import { mapSurveyResponseRowToDTO, type SurveyResponseDTO } from "@/modules/surveys/shared/types/dto"
import { submitSurveyResponseActionSchema } from "@/modules/surveys/shared/validations/submit-survey-response.schema"
import type { OperationResponse } from "@/shared/types/operation-response.types"

type ErrorCodes = "invalid_input" | "org_not_found" | "survey_not_found" | "not_allowed" | "already_answered" | "invalid_answers" | "infra_error"

export async function submitSurveyResponseAction(input: unknown): OperationResponse<{ response: SurveyResponseDTO }, ErrorCodes> {
	const parsed = submitSurveyResponseActionSchema.safeParse(input)
	if (!parsed.success) {
		return {
			success: false,
			message: "Dados inválidos para registrar resposta da pesquisa.",
			code: "invalid_input"
		}
	}

	const res = await submitSurveyResponseUseCase({
		surveyId: parsed.data.surveyId,
		organizationId: parsed.data.organizationId ?? null,
		isAnonymous: parsed.data.isAnonymous,
		respondentName: parsed.data.respondentName ?? null,
		respondentEmail: parsed.data.respondentEmail ?? null,
		respondentPhone: parsed.data.respondentPhone ?? null,
		answers: parsed.data.answers
	})

	if (res.success === false) return res

	return {
		success: true,
		message: res.message,
		data: {
			response: mapSurveyResponseRowToDTO(res.data.response)
		}
	}
}

"use server"

import { createSurveyUseCase } from "@/modules/surveys/server/slices/create-survey/use-cases/create-survey.use-case"
import { mapSurveyRowToSurveySummaryDTO, type SurveySummaryDTO } from "@/modules/surveys/shared/types/dto"
import { createSurveyActionSchema } from "@/modules/surveys/shared/validations/create-survey.schema"
import type { OperationResponse } from "@/shared/types/operation-response.types"

type ErrorCodes = "invalid_input" | "unauthenticated" | "not_allowed" | "organization_not_found" | "infra_error"

export async function createSurveyAction(input: unknown): OperationResponse<{ survey: SurveySummaryDTO }, ErrorCodes> {
	const parsed = createSurveyActionSchema.safeParse(input)
	if (!parsed.success) {
		return {
			success: false,
			message: "Dados inválidos para criação da pesquisa.",
			code: "invalid_input"
		}
	}

	const res = await createSurveyUseCase({
		organizationId: parsed.data.organizationId,
		title: parsed.data.title,
		description: parsed.data.description ?? null,
		visibility: parsed.data.visibility,
		acceptAnonymousAnswers: parsed.data.acceptAnonymousAnswers,
		startsAt: parsed.data.startsAt ?? null,
		endsAt: parsed.data.endsAt ?? null,
		questions: parsed.data.questions
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

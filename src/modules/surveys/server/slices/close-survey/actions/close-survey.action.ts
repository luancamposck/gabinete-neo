"use server"

import { closeSurveyUseCase } from "@/modules/surveys/server/slices/close-survey/use-cases/close-survey.use-case"
import type { SurveyRow } from "@/modules/surveys/shared/types/db"
import { closeSurveyActionSchema } from "@/modules/surveys/shared/validations/close-survey.schema"
import type { OperationResponse } from "@/shared/types/operation-response.types"

type ErrorCodes = "invalid_input" | "unauthenticated" | "not_allowed" | "organization_not_found" | "survey_not_found" | "infra_error"

export async function closeSurveyAction(input: unknown): OperationResponse<{ survey: SurveyRow }, ErrorCodes> {
	const parsed = closeSurveyActionSchema.safeParse(input)
	if (!parsed.success) {
		return {
			success: false,
			message: "Dados inválidos para encerramento da pesquisa.",
			code: "invalid_input"
		}
	}

	return closeSurveyUseCase(parsed.data)
}

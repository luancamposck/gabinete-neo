"use server"

import { createSurveyUseCase } from "@/modules/surveys/server/slices/create-survey/use-cases/create-survey.use-case"
import type { SurveyRow } from "@/modules/surveys/shared/types/db"
import { createSurveyActionSchema } from "@/modules/surveys/shared/validations/create-survey.schema"
import type { OperationResponse } from "@/shared/types/operation-response.types"

type ErrorCodes = "invalid_input" | "unauthenticated" | "not_allowed" | "organization_not_found" | "infra_error"

export async function createSurveyAction(input: unknown): OperationResponse<{ survey: SurveyRow }, ErrorCodes> {
	const parsed = createSurveyActionSchema.safeParse(input)
	if (!parsed.success) {
		return {
			success: false,
			message: "Dados inválidos para criação da pesquisa.",
			code: "invalid_input"
		}
	}

	return createSurveyUseCase({
		organizationId: parsed.data.organizationId,
		title: parsed.data.title,
		description: parsed.data.description ?? null,
		visibility: parsed.data.visibility,
		acceptAnonymousAnswers: parsed.data.acceptAnonymousAnswers,
		startsAt: parsed.data.startsAt ?? null,
		endsAt: parsed.data.endsAt ?? null
	})
}

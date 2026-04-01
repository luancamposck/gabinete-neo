"use server"

import { listPublicSurveysUseCase } from "@/modules/surveys/server/slices/list-public-surveys/use-cases/list-public-surveys.use-case"
import { mapSurveyRowToSurveySummaryDTO, type SurveyPublicListItemDTO } from "@/modules/surveys/shared/types/dto"
import type { OperationResponse } from "@/shared/types/operation-response.types"

type ListPublicSurveysActionRes = {
	surveys: SurveyPublicListItemDTO[]
}

type ListPublicSurveysActionCode = "org_not_found" | "infra_error"

export async function listPublicSurveysAction(): OperationResponse<ListPublicSurveysActionRes, ListPublicSurveysActionCode> {
	const res = await listPublicSurveysUseCase()
	if (res.success === false) return res

	return {
		success: true,
		message: res.message,
		data: {
			surveys: res.data.surveys.map(mapSurveyRowToSurveySummaryDTO)
		}
	}
}

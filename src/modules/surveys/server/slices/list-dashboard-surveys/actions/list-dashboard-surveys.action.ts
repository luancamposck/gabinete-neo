"use server"

import { listDashboardSurveysUseCase } from "@/modules/surveys/server/slices/list-dashboard-surveys/use-cases/list-dashboard-surveys.use-case"
import { mapSurveyRowToSurveySummaryDTO, type SurveyDashboardListItemDTO } from "@/modules/surveys/shared/types/dto"
import type { OperationResponse } from "@/shared/types/operation-response.types"

type ListDashboardSurveysActionRes = {
	surveys: SurveyDashboardListItemDTO[]
}

type ListDashboardSurveysActionCode = "unauthenticated" | "org_not_found" | "not_member" | "infra_error"

export async function listDashboardSurveysAction(): OperationResponse<ListDashboardSurveysActionRes, ListDashboardSurveysActionCode> {
	const res = await listDashboardSurveysUseCase()
	if (res.success === false) return res

	return {
		success: true,
		message: res.message,
		data: {
			surveys: res.data.surveys.map(mapSurveyRowToSurveySummaryDTO)
		}
	}
}

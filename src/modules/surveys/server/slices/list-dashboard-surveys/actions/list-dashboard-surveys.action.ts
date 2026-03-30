"use server"

import { listDashboardSurveysUseCase } from "@/modules/surveys/server/slices/list-dashboard-surveys/use-cases/list-dashboard-surveys.use-case"
import type { SurveyListItemDTO } from "@/modules/surveys/shared/types/dto"
import type { OperationResponse } from "@/shared/types/operation-response.types"

type ListDashboardSurveysActionRes = {
	surveys: SurveyListItemDTO[]
}

type ListDashboardSurveysActionCode = "unauthenticated" | "org_not_found" | "not_member" | "infra_error"

export async function listDashboardSurveysAction(): OperationResponse<ListDashboardSurveysActionRes, ListDashboardSurveysActionCode> {
	const res = await listDashboardSurveysUseCase()
	if (res.success === false) return res

	return {
		success: true,
		message: res.message,
		data: {
			surveys: res.data.surveys.map((survey) => ({
				id: survey.id,
				organizationId: survey.organization_id,
				title: survey.title,
				description: survey.description,
				status: survey.status,
				visibility: survey.visibility,
				startsAt: survey.starts_at,
				endsAt: survey.ends_at,
				acceptAnonymousAnswers: survey.accept_anonymous_answers,
				createdAt: survey.created_at,
				updatedAt: survey.updated_at,
				createdByUserId: survey.created_by_user_id
			}))
		}
	}
}

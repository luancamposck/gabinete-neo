"use server"

import { listPublicSurveysUseCase } from "@/modules/surveys/server/slices/list-public-surveys/use-cases/list-public-surveys.use-case"
import type { SurveyListItemDTO } from "@/modules/surveys/shared/types/dto"
import type { OperationResponse } from "@/shared/types/operation-response.types"

type ListPublicSurveysActionRes = {
	surveys: SurveyListItemDTO[]
}

type ListPublicSurveysActionCode = "org_not_found" | "infra_error"

export async function listPublicSurveysAction(): OperationResponse<ListPublicSurveysActionRes, ListPublicSurveysActionCode> {
	const res = await listPublicSurveysUseCase()
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

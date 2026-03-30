import { updateSurveyByIdRepo } from "@/modules/surveys/server/repos/update-survey-by-id.repo"
import type { SurveyRow } from "@/modules/surveys/shared/types/db"
import type { OperationResponse } from "@/shared/types/operation-response.types"

const MSG_INFRA_ERROR = "Não foi possível atualizar a pesquisa."

export async function updateSurveyService(params: {
	organizationId: string
	surveyId: string
	updates: {
		title?: string
		description?: string | null
		visibility?: "public" | "private"
		acceptAnonymousAnswers?: boolean
		startsAt?: string | null
		endsAt?: string | null
	}
}): OperationResponse<{ survey: SurveyRow }, "infra_error"> {
	const { data, error } = await updateSurveyByIdRepo({
		organizationId: params.organizationId,
		surveyId: params.surveyId,
		updates: {
			title: params.updates.title,
			description: params.updates.description,
			visibility: params.updates.visibility,
			accept_anonymous_answers: params.updates.acceptAnonymousAnswers,
			starts_at: params.updates.startsAt,
			ends_at: params.updates.endsAt
		}
	})

	if (error || !data) {
		return {
			success: false,
			message: MSG_INFRA_ERROR,
			code: "infra_error"
		}
	}

	return {
		success: true,
		message: "Pesquisa atualizada com sucesso.",
		data: {
			survey: data
		}
	}
}

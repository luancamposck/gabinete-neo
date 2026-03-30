import { insertSurveyRepo } from "@/modules/surveys/server/repos/insert-survey.repo"
import type { SurveyRow } from "@/modules/surveys/shared/types/db"
import type { OperationResponse } from "@/shared/types/operation-response.types"

const MSG_INFRA_ERROR = "Não foi possível criar a pesquisa. Tente novamente em instantes."

export async function createSurveyService(params: {
	organizationId: string
	createdByUserId: string
	title: string
	description: string | null
	visibility: "public" | "private"
	acceptAnonymousAnswers: boolean
	startsAt: string | null
	endsAt: string | null
}): OperationResponse<{ survey: SurveyRow }, "infra_error"> {
	const { data, error } = await insertSurveyRepo({
		organization_id: params.organizationId,
		created_by_user_id: params.createdByUserId,
		title: params.title,
		description: params.description,
		visibility: params.visibility,
		accept_anonymous_answers: params.acceptAnonymousAnswers,
		starts_at: params.startsAt,
		ends_at: params.endsAt,
		status: "draft"
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
		message: "Pesquisa criada com sucesso.",
		data: {
			survey: data
		}
	}
}

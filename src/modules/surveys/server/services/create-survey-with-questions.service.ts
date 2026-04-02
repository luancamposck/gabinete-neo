import { createSurveyWithQuestionsRepo } from "@/modules/surveys/server/repos/create-survey-with-questions.repo"
import type { SurveyRow } from "@/modules/surveys/shared/types/db"
import type { SurveyQuestionSchemaData } from "@/modules/surveys/shared/validations/survey-question.schema"
import type { OperationResponse } from "@/shared/types/operation-response.types"
import type { Json } from "@/shared/types/supabase"

const MSG_INFRA_ERROR = "Não foi possível criar a pesquisa. Tente novamente em instantes."

type CreateSurveyWithQuestionsServiceParams = {
	organizationId: string
	createdByUserId: string
	title: string
	description: string | null
	visibility: "public" | "private"
	acceptAnonymousAnswers: boolean
	startsAt: string | null
	endsAt: string | null
	questions: SurveyQuestionSchemaData[]
}

export async function createSurveyWithQuestionsService(params: CreateSurveyWithQuestionsServiceParams): OperationResponse<{ survey: SurveyRow }, "infra_error"> {
	const { data, error } = await createSurveyWithQuestionsRepo({
		organizationId: params.organizationId,
		createdByUserId: params.createdByUserId,
		title: params.title,
		description: params.description,
		visibility: params.visibility,
		acceptAnonymousAnswers: params.acceptAnonymousAnswers,
		startsAt: params.startsAt,
		endsAt: params.endsAt,
		questions: params.questions as Json
	})

	if (error || !data) {
		if (error) {
			console.error("[createSurveyWithQuestionsService]:", error.message)
		}

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

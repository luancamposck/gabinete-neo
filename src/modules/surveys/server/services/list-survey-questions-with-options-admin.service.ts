import { listSurveyQuestionsWithOptionsAdminRepo } from "@/modules/surveys/server/repos/list-survey-questions-with-options.admin.repo"
import type { SurveyQuestionOptionRow, SurveyQuestionRow } from "@/modules/surveys/shared/types/db"
import type { OperationResponse } from "@/shared/types/operation-response.types"

type SurveyQuestionWithOptions = Pick<SurveyQuestionRow, "id" | "title" | "description" | "type" | "required" | "position" | "config_json"> & {
	survey_question_options: Pick<SurveyQuestionOptionRow, "id" | "label" | "value" | "position">[]
}

export async function listSurveyQuestionsWithOptionsAdminService(params: { surveyId: string }): OperationResponse<{ questions: SurveyQuestionWithOptions[] }, "infra_error"> {
	const { data, error } = await listSurveyQuestionsWithOptionsAdminRepo(params)

	if (error) {
		console.error("[listSurveyQuestionsWithOptionsAdminService]:", error.message)
		return {
			success: false,
			message: "Não foi possível carregar questões da pesquisa.",
			code: "infra_error"
		}
	}

	return {
		success: true,
		message: "Questões carregadas com sucesso.",
		data: {
			questions: (data ?? []).map((question) => ({
				...question,
				survey_question_options: (question.survey_question_options ?? []).sort((a, b) => a.position - b.position)
			}))
		}
	}
}

import { insertSurveyQuestionsRepo } from "@/modules/surveys/server/repos/insert-survey-questions.repo"
import type { SurveyQuestionInsert, SurveyQuestionRow } from "@/modules/surveys/shared/types/db"
import type { OperationResponse } from "@/shared/types/operation-response.types"

export async function insertSurveyQuestionsService(params: SurveyQuestionInsert[]): OperationResponse<{ questions: SurveyQuestionRow[] }, "infra_error"> {
	const { data, error } = await insertSurveyQuestionsRepo(params)

	if (error) {
		console.error("[insertSurveyQuestionsService]:", error.message)
		return {
			success: false,
			message: "Não foi possível salvar questões da pesquisa.",
			code: "infra_error"
		}
	}

	return {
		success: true,
		message: "Questões salvas com sucesso.",
		data: {
			questions: data ?? []
		}
	}
}

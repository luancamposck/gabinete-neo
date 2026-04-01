import { insertSurveyQuestionOptionsRepo } from "@/modules/surveys/server/repos/insert-survey-question-options.repo"
import type { SurveyQuestionOptionInsert, SurveyQuestionOptionRow } from "@/modules/surveys/shared/types/db"
import type { OperationResponse } from "@/shared/types/operation-response.types"

export async function insertSurveyQuestionOptionsService(params: SurveyQuestionOptionInsert[]): OperationResponse<{ options: SurveyQuestionOptionRow[] }, "infra_error"> {
	const { data, error } = await insertSurveyQuestionOptionsRepo(params)

	if (error) {
		console.error("[insertSurveyQuestionOptionsService]:", error.message)
		return {
			success: false,
			message: "Não foi possível salvar opções das questões.",
			code: "infra_error"
		}
	}

	return {
		success: true,
		message: "Opções salvas com sucesso.",
		data: {
			options: data ?? []
		}
	}
}

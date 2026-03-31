import { deleteSurveyQuestionsBySurveyIdRepo } from "@/modules/surveys/server/repos/delete-survey-questions-by-survey-id.repo"
import type { OperationResponse } from "@/shared/types/operation-response.types"

export async function deleteSurveyQuestionsBySurveyIdService(params: { surveyId: string }): OperationResponse<Record<string, never>, "infra_error"> {
	const { error } = await deleteSurveyQuestionsBySurveyIdRepo(params)

	if (error) {
		console.error("[deleteSurveyQuestionsBySurveyIdService]:", error.message)
		return {
			success: false,
			message: "Não foi possível limpar questões da pesquisa.",
			code: "infra_error"
		}
	}

	return {
		success: true,
		message: "Questões removidas com sucesso.",
		data: {}
	}
}

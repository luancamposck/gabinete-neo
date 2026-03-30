import { countSurveyQuestionsRepo } from "@/modules/surveys/server/repos/count-survey-questions.repo"
import type { OperationResponse } from "@/shared/types/operation-response.types"

const MSG_INFRA_ERROR = "Não foi possível contar as perguntas da pesquisa."

export async function countSurveyQuestionsService(params: { surveyId: string }): OperationResponse<{ count: number }, "infra_error"> {
	const { count, error } = await countSurveyQuestionsRepo(params)

	if (error) {
		return {
			success: false,
			message: MSG_INFRA_ERROR,
			code: "infra_error"
		}
	}

	return {
		success: true,
		message: "Quantidade de perguntas obtida com sucesso.",
		data: {
			count: count ?? 0
		}
	}
}

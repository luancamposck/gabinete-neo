import { countSurveyResponsesAdminRepo } from "@/modules/surveys/server/repos/count-survey-responses.admin.repo"
import type { OperationResponse } from "@/shared/types/operation-response.types"

const MSG_INFRA_ERROR = "Não foi possível contar as respostas da pesquisa."

export async function countSurveyResponsesAdminService(params: { surveyId: string }): OperationResponse<{ count: number }, "infra_error"> {
	const { count, error } = await countSurveyResponsesAdminRepo(params)

	if (error) {
		return {
			success: false,
			message: MSG_INFRA_ERROR,
			code: "infra_error"
		}
	}

	return {
		success: true,
		message: "Quantidade de respostas obtida com sucesso.",
		data: {
			count: count ?? 0
		}
	}
}

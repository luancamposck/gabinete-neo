import { updateSurveyByIdRepo } from "@/modules/surveys/server/repos/update-survey-by-id.repo"
import type { SurveyRow } from "@/modules/surveys/shared/types/db"
import type { OperationResponse } from "@/shared/types/operation-response.types"

const MSG_INFRA_ERROR = "Não foi possível encerrar a pesquisa."

export async function closeSurveyService(params: { organizationId: string; surveyId: string }): OperationResponse<{ survey: SurveyRow }, "infra_error"> {
	const { data, error } = await updateSurveyByIdRepo({
		organizationId: params.organizationId,
		surveyId: params.surveyId,
		updates: {
			status: "closed"
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
		message: "Pesquisa encerrada com sucesso.",
		data: {
			survey: data
		}
	}
}

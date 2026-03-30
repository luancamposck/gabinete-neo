import { findSurveyByIdRepo } from "@/modules/surveys/server/repos/find-survey-by-id.repo"
import type { SurveyRow } from "@/modules/surveys/shared/types/db"
import type { OperationResponse } from "@/shared/types/operation-response.types"

const MSG_SURVEY_NOT_FOUND = "Pesquisa não encontrada."
const MSG_INFRA_ERROR = "Não foi possível obter a pesquisa."

export async function findSurveyByIdService(params: { organizationId: string; surveyId: string }): OperationResponse<{ survey: SurveyRow }, "survey_not_found" | "infra_error"> {
	const { data, error } = await findSurveyByIdRepo(params)

	if (error) {
		return {
			success: false,
			message: MSG_INFRA_ERROR,
			code: "infra_error"
		}
	}

	if (!data) {
		return {
			success: false,
			message: MSG_SURVEY_NOT_FOUND,
			code: "survey_not_found"
		}
	}

	return {
		success: true,
		message: "Pesquisa obtida com sucesso.",
		data: {
			survey: data
		}
	}
}

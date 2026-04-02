import { findSurveyByIdAdminRepo } from "@/modules/surveys/server/repos/find-survey-by-id.admin.repo"
import type { SurveyRow } from "@/modules/surveys/shared/types/db"
import type { OperationResponse } from "@/shared/types/operation-response.types"

const MSG_SURVEY_NOT_FOUND = "Pesquisa não encontrada."
const MSG_INFRA_ERROR = "Não foi possível obter a pesquisa."

export async function findSurveyByIdAdminService(params: { surveyId: string }): OperationResponse<{ survey: SurveyRow }, "survey_not_found" | "infra_error"> {
	const { data, error } = await findSurveyByIdAdminRepo(params)

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

import { insertSurveyResponseItemsRepo } from "@/modules/surveys/server/repos/insert-survey-response-items.repo"
import type { SurveyResponseItemInsert, SurveyResponseItemRow } from "@/modules/surveys/shared/types/db"
import type { OperationResponse } from "@/shared/types/operation-response.types"

export async function insertSurveyResponseItemsService(params: SurveyResponseItemInsert[]): OperationResponse<{ items: SurveyResponseItemRow[] }, "infra_error"> {
	const { data, error } = await insertSurveyResponseItemsRepo(params)

	if (error) {
		console.error("[insertSurveyResponseItemsService]:", error.message)
		return {
			success: false,
			message: "Não foi possível registrar itens da resposta.",
			code: "infra_error"
		}
	}

	return {
		success: true,
		message: "Itens da resposta registrados com sucesso.",
		data: {
			items: data ?? []
		}
	}
}

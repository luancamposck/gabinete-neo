import { insertSurveyResponseRepo } from "@/modules/surveys/server/repos/insert-survey-response.repo"
import type { SurveyResponseInsert, SurveyResponseRow } from "@/modules/surveys/shared/types/db"
import type { OperationResponse } from "@/shared/types/operation-response.types"

type ErrorCodes = "already_answered" | "infra_error"

const prefixLog = "[submitSurveyResponseService]:"
const MSG_INFRA_ERROR = "Não foi possível registrar a resposta da pesquisa. Tente novamente em instantes."
const MSG_ALREADY_ANSWERED = "Você já respondeu esta pesquisa."

export async function submitSurveyResponseService(params: SurveyResponseInsert): OperationResponse<{ response: SurveyResponseRow }, ErrorCodes> {
	try {
		const { data, error } = await insertSurveyResponseRepo(params)

		if (error) {
			if (error.code === "23505") {
				return {
					success: false,
					message: MSG_ALREADY_ANSWERED,
					code: "already_answered"
				}
			}

			console.error(`${prefixLog} ${error.message}`)
			return {
				success: false,
				message: MSG_INFRA_ERROR,
				code: "infra_error"
			}
		}

		if (!data) {
			console.error(`${prefixLog} missing survey response after insert`)
			return {
				success: false,
				message: MSG_INFRA_ERROR,
				code: "infra_error"
			}
		}

		return {
			success: true,
			message: "Resposta registrada com sucesso.",
			data: {
				response: data
			}
		}
	} catch (error) {
		console.error(`${prefixLog} unexpected error:`, error)
		return {
			success: false,
			message: MSG_INFRA_ERROR,
			code: "infra_error"
		}
	}
}

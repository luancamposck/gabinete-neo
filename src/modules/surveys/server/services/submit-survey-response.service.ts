import { insertSurveyResponseRepo } from "@/modules/surveys/server/repos/insert-survey-response.repo"
import type { SurveyResponseInsert, SurveyResponseRow } from "@/modules/surveys/shared/types/db"
import type { OperationResponse } from "@/shared/types/operation-response.types"

type ErrorCodes = "already_answered" | "infra_error"

const prefixLog = "[submitSurveyResponseService]:"
const MSG_INFRA_ERROR = "Não foi possível registrar a resposta da pesquisa. Tente novamente em instantes."
const MSG_ALREADY_ANSWERED = "Você já respondeu esta pesquisa."

export async function submitSurveyResponseService(params: SurveyResponseInsert): OperationResponse<{ response: SurveyResponseRow }, ErrorCodes> {
	try {
		const { error } = await insertSurveyResponseRepo(params)

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

		return {
			success: true,
			message: "Resposta registrada com sucesso.",
			data: {
				response: {
					id: params.id ?? "",
					survey_id: params.survey_id,
					organization_id: params.organization_id ?? null,
					respondent_user_id: params.respondent_user_id ?? null,
					respondent_name: params.respondent_name ?? null,
					respondent_email: params.respondent_email ?? null,
					respondent_phone: params.respondent_phone ?? null,
					is_anonymous: params.is_anonymous ?? false,
					responder_fingerprint_hash: params.responder_fingerprint_hash ?? null,
					submitted_at: params.submitted_at ?? new Date().toISOString()
				}
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

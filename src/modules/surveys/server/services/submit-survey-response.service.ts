import { submitSurveyResponseRepo } from "@/modules/surveys/server/repos/submit-survey-response.repo"
import type { SurveyResponseRow } from "@/modules/surveys/shared/types/db"
import type { OperationResponse } from "@/shared/types/operation-response.types"
import type { Json } from "@/shared/types/supabase"

type ErrorCodes = "already_answered" | "infra_error"

const prefixLog = "[submitSurveyResponseService]:"
const MSG_INFRA_ERROR = "Não foi possível registrar a resposta da pesquisa. Tente novamente em instantes."
const MSG_ALREADY_ANSWERED = "Você já respondeu esta pesquisa."

type SubmitSurveyResponseServiceParams = {
	responseId: string
	surveyId: string
	organizationId: string | null
	respondentUserId: string | null
	respondentName: string | null
	respondentEmail: string | null
	respondentPhone: string | null
	isAnonymous: boolean
	responderFingerprintHash: string | null
	submittedAt: string
	answers: {
		questionId: string
		answerText?: string | null
		answerOptionIds?: string[]
		answerRanking?: string[]
	}[]
}

export async function submitSurveyResponseService(params: SubmitSurveyResponseServiceParams): OperationResponse<{ response: SurveyResponseRow }, ErrorCodes> {
	try {
		const { data, error } = await submitSurveyResponseRepo({
			responseId: params.responseId,
			surveyId: params.surveyId,
			organizationId: params.organizationId,
			respondentUserId: params.respondentUserId,
			respondentName: params.respondentName,
			respondentEmail: params.respondentEmail,
			respondentPhone: params.respondentPhone,
			isAnonymous: params.isAnonymous,
			responderFingerprintHash: params.responderFingerprintHash,
			submittedAt: params.submittedAt,
			answers: params.answers as Json
		})

		if (error || !data) {
			if (error?.code === "23505") {
				return {
					success: false,
					message: MSG_ALREADY_ANSWERED,
					code: "already_answered"
				}
			}

			if (error) {
				console.error(`${prefixLog} ${error.message}`)
			}

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

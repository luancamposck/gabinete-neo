import { getCurrentAuthUserService } from "@/modules/auth/server/services/get-current-auth-user.service"
import { submitSurveyResponseService } from "@/modules/surveys/server/services/submit-survey-response.service"
import { buildResponderFingerprintHash, ensureStableResponderCookie } from "@/modules/surveys/server/utils/responder-fingerprint"
import type { SurveyResponseRow } from "@/modules/surveys/shared/types/db"
import type { OperationResponse } from "@/shared/types/operation-response.types"

type SubmitSurveyResponseUseCaseParams = {
	surveyId: string
	organizationId?: string | null
	isAnonymous?: boolean
}

type ErrorCodes = "already_answered" | "infra_error"

const prefixLog = "[submitSurveyResponseUseCase]:"
const MSG_SUCCESS = "Resposta registrada com sucesso."
const MSG_INFRA_ERROR = "Não foi possível registrar sua resposta agora. Tente novamente em instantes."
const MSG_ALREADY_ANSWERED = "Você já respondeu esta pesquisa."

const FALLBACK_INFRA_ERROR = {
	success: false,
	message: MSG_INFRA_ERROR,
	code: "infra_error"
} as const

export async function submitSurveyResponseUseCase(params: SubmitSurveyResponseUseCaseParams): OperationResponse<{ response: SurveyResponseRow }, ErrorCodes> {
	try {
		// ============================================================
		// 0) Resolver contexto de autenticação e modo de resposta
		//
		// Possibilidades:
		// - usuário autenticado + não anônima => usar respondent_user_id
		// - usuário não autenticado OU resposta anônima => usar fingerprint
		// ============================================================
		const authRes = await getCurrentAuthUserService()
		if (authRes.success === false && authRes.code === "infra_error") {
			return FALLBACK_INFRA_ERROR
		}

		const authUserId = authRes.success ? authRes.data.user.id : null
		const isAnonymousAnswer = params.isAnonymous ?? false
		const mustUseFingerprint = !authUserId || isAnonymousAnswer

		// ============================================================
		// 1) Calcular identificadores anti-duplicidade conforme contexto
		//
		// Possibilidades:
		// - modo autenticado não anônimo => unique (survey_id, respondent_user_id)
		// - modo fingerprint => unique (survey_id, responder_fingerprint_hash)
		// ============================================================
		const respondentUserId = mustUseFingerprint ? null : authUserId
		let responderFingerprintHash: string | null = null

		if (mustUseFingerprint) {
			const stableCookieId = await ensureStableResponderCookie()
			responderFingerprintHash = await buildResponderFingerprintHash({
				surveyId: params.surveyId,
				stableCookieId
			})
		}

		// ============================================================
		// 2) Persistir resposta e mapear conflitos de unicidade
		//
		// Possibilidades:
		// - unique violation => already_answered
		// - erro infra => infra_error
		// - sucesso => response registrada
		// ============================================================
		const submitRes = await submitSurveyResponseService({
			survey_id: params.surveyId,
			organization_id: params.organizationId ?? null,
			respondent_user_id: respondentUserId,
			is_anonymous: mustUseFingerprint,
			responder_fingerprint_hash: responderFingerprintHash
		})

		if (submitRes.success === false) {
			if (submitRes.code === "already_answered") {
				return {
					success: false,
					message: MSG_ALREADY_ANSWERED,
					code: "already_answered"
				}
			}

			return FALLBACK_INFRA_ERROR
		}

		return {
			success: true,
			message: MSG_SUCCESS,
			data: {
				response: submitRes.data.response
			}
		}
	} catch (error) {
		console.error(`${prefixLog} unexpected error:`, error)
		return FALLBACK_INFRA_ERROR
	}
}

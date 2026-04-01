import { getCurrentAuthUserService } from "@/modules/auth/server/services/get-current-auth-user.service"
import { insertSurveyResponseItemsService } from "@/modules/surveys/server/services/insert-survey-response-items.service"
import { listSurveyQuestionsWithOptionsService } from "@/modules/surveys/server/services/list-survey-questions-with-options.service"
import { submitSurveyResponseService } from "@/modules/surveys/server/services/submit-survey-response.service"
import { buildResponderFingerprintHash, ensureStableResponderCookie } from "@/modules/surveys/server/utils/responder-fingerprint"
import type { SurveyResponseRow } from "@/modules/surveys/shared/types/db"
import { validateSurveyAnswers } from "@/modules/surveys/shared/validations/survey-response.schema"
import type { OperationResponse } from "@/shared/types/operation-response.types"

type SubmitSurveyResponseUseCaseParams = {
	surveyId: string
	organizationId?: string | null
	isAnonymous?: boolean
	respondentName?: string | null
	respondentEmail?: string | null
	respondentPhone?: string | null
	answers: {
		questionId: string
		answerText?: string | null
		answerOptionIds?: string[]
		answerRanking?: string[]
	}[]
}

type ErrorCodes = "already_answered" | "invalid_answers" | "infra_error"

const prefixLog = "[submitSurveyResponseUseCase]:"
const MSG_SUCCESS = "Resposta registrada com sucesso."
const MSG_INFRA_ERROR = "Não foi possível registrar sua resposta agora. Tente novamente em instantes."
const MSG_ALREADY_ANSWERED = "Você já respondeu esta pesquisa."
const MSG_INVALID_ANSWERS = "As respostas enviadas são inválidas para esta pesquisa."

const FALLBACK_INFRA_ERROR = {
	success: false,
	message: MSG_INFRA_ERROR,
	code: "infra_error"
} as const

function normalizeOptionalIdentityField(value?: string | null) {
	const trimmed = value?.trim()

	return trimmed && trimmed.length > 0 ? trimmed : null
}

export async function submitSurveyResponseUseCase(params: SubmitSurveyResponseUseCaseParams): OperationResponse<{ response: SurveyResponseRow }, ErrorCodes> {
	try {
		// ============================================================
		// 0) Resolver contexto de autenticação e modo de resposta
		//
		// Possibilidades:
		// - usuário autenticado + não anônima => usar respondent_user_id
		// - usuário não autenticado + não anônima => usar fingerprint + snapshot manual
		// - resposta anônima => usar fingerprint e limpar identidade
		// ============================================================
		const authRes = await getCurrentAuthUserService()
		if (authRes.success === false && authRes.code === "infra_error") {
			return FALLBACK_INFRA_ERROR
		}

		const authUserId = authRes.success ? authRes.data.user.id : null
		const isAnonymousAnswer = params.isAnonymous ?? false
		const isPublicIdentifiedAnswer = !authUserId && !isAnonymousAnswer
		const mustUseFingerprint = !authUserId || isAnonymousAnswer
		const respondentName = isAnonymousAnswer ? null : normalizeOptionalIdentityField(params.respondentName)
		const respondentEmail = isAnonymousAnswer ? null : normalizeOptionalIdentityField(params.respondentEmail)
		const respondentPhone = isAnonymousAnswer ? null : normalizeOptionalIdentityField(params.respondentPhone)

		// ============================================================
		// 1) Carregar questões da survey e validar respostas enviadas
		//
		// Possibilidades:
		// - erro de infra ao buscar questões => infra_error
		// - payload inválido (required/ranking/etc) => invalid_answers
		// - payload válido => seguir fluxo
		// ============================================================
		const questionsRes = await listSurveyQuestionsWithOptionsService({ surveyId: params.surveyId })
		if (questionsRes.success === false) {
			return FALLBACK_INFRA_ERROR
		}

		const validateRes = validateSurveyAnswers({
			questions: questionsRes.data.questions.map((question) => ({
				id: question.id,
				title: question.title,
				description: question.description,
				type: question.type,
				required: question.required,
				position: question.position,
				configJson: question.config_json,
				options: question.survey_question_options.map((option) => ({
					id: option.id,
					label: option.label,
					value: option.value,
					position: option.position
				}))
			})),
			answers: params.answers
		})

		if (!validateRes.success) {
			return {
				success: false,
				message: validateRes.message || MSG_INVALID_ANSWERS,
				code: "invalid_answers"
			}
		}

		// ============================================================
		// 2) Calcular identificadores anti-duplicidade conforme contexto
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
		// 3) Persistir cabeçalho da resposta e mapear conflitos
		//
		// Possibilidades:
		// - unique violation => already_answered
		// - erro infra => infra_error
		// - sucesso => seguir para salvar itens
		// ============================================================
		const submitRes = await submitSurveyResponseService({
			survey_id: params.surveyId,
			organization_id: params.organizationId ?? null,
			respondent_user_id: isAnonymousAnswer ? null : respondentUserId,
			respondent_name: isPublicIdentifiedAnswer ? respondentName : null,
			respondent_email: isPublicIdentifiedAnswer ? respondentEmail : null,
			respondent_phone: isPublicIdentifiedAnswer ? respondentPhone : null,
			is_anonymous: isAnonymousAnswer,
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

		// ============================================================
		// 4) Persistir itens da resposta por questão
		//
		// Possibilidades:
		// - erro de infra ao inserir itens => infra_error
		// - sucesso => finalizar com response criada
		// ============================================================
		const answerItems = params.answers.map((answer) => ({
			response_id: submitRes.data.response.id,
			question_id: answer.questionId,
			answer_text: answer.answerText ?? null,
			answer_option_ids_json: answer.answerOptionIds ?? null,
			answer_ranking_json: answer.answerRanking ?? null
		}))

		if (answerItems.length > 0) {
			const itemsRes = await insertSurveyResponseItemsService(answerItems)
			if (itemsRes.success === false) {
				return FALLBACK_INFRA_ERROR
			}
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

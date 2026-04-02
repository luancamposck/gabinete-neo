import { randomUUID } from "node:crypto"
import { getCurrentAuthUserService } from "@/modules/auth/server/services/get-current-auth-user.service"
import { isUserMemberOfOrganizationService } from "@/modules/organizations/memberships/server/services/is-user-member-of-organization.service"
import { getOrganizationByIdService } from "@/modules/organizations/server/services/get-organization-by-id.service"
import { getOrganizationIdByAppDomainService } from "@/modules/organizations/server/services/get-organization-id-by-app-domain.service"
import { findSurveyByIdAdminService } from "@/modules/surveys/server/services/find-survey-by-id-admin.service"
import { listSurveyQuestionsWithOptionsService } from "@/modules/surveys/server/services/list-survey-questions-with-options.service"
import { submitSurveyResponseService } from "@/modules/surveys/server/services/submit-survey-response.service"
import { buildResponderFingerprintHash, ensureStableResponderCookie } from "@/modules/surveys/server/utils/responder-fingerprint"
import type { SurveyResponseRow, SurveyRow } from "@/modules/surveys/shared/types/db"
import { validateSurveyAnswers } from "@/modules/surveys/shared/validations/survey-response.schema"
import { getRequestHost } from "@/shared/http/get-request-host"
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

type ErrorCodes = "org_not_found" | "survey_not_found" | "not_allowed" | "already_answered" | "invalid_answers" | "infra_error"

const prefixLog = "[submitSurveyResponseUseCase]:"
const MSG_SUCCESS = "Resposta registrada com sucesso."
const MSG_ORG_NOT_FOUND = "Não foi possível identificar a organização desta pesquisa."
const MSG_SURVEY_NOT_FOUND = "Pesquisa não encontrada."
const MSG_NOT_ALLOWED = "Você não tem permissão para responder esta pesquisa no momento."
const MSG_INFRA_ERROR = "Não foi possível registrar sua resposta agora. Tente novamente em instantes."
const MSG_ALREADY_ANSWERED = "Você já respondeu esta pesquisa."
const MSG_INVALID_ANSWERS = "As respostas enviadas são inválidas para esta pesquisa."
const MSG_IDENTIFIED_PUBLIC_RESPONSE_REQUIRES_IDENTITY = "Informe nome, e-mail e telefone para enviar uma resposta pública identificada."

const FALLBACK_INFRA_ERROR = {
	success: false,
	message: MSG_INFRA_ERROR,
	code: "infra_error"
} as const

function normalizeOptionalIdentityField(value?: string | null) {
	const trimmed = value?.trim()

	return trimmed && trimmed.length > 0 ? trimmed : null
}

function isSurveyAcceptingResponses(survey: SurveyRow, now = new Date()) {
	if (survey.status !== "published") {
		return false
	}

	const startsAt = survey.starts_at ? new Date(survey.starts_at) : null
	const endsAt = survey.ends_at ? new Date(survey.ends_at) : null

	if ((startsAt && Number.isNaN(startsAt.getTime())) || (endsAt && Number.isNaN(endsAt.getTime()))) {
		return false
	}

	if (startsAt && startsAt > now) {
		return false
	}

	if (endsAt && endsAt < now) {
		return false
	}

	return true
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
		// 1) Resolver tenant atual por host ou fallback explícito
		//
		// Possibilidades:
		// - host/org não encontrados => org_not_found
		// - erro técnico => infra_error
		// - tenant resolvido => seguir fluxo
		// ============================================================
		let currentOrganizationId: string | null = null
		const host = await getRequestHost()

		if (host) {
			const orgByHostRes = await getOrganizationIdByAppDomainService({ appDomain: host })
			if (orgByHostRes.success === false) {
				if (orgByHostRes.code === "org_not_found") {
					return {
						success: false,
						message: MSG_ORG_NOT_FOUND,
						code: "org_not_found"
					}
				}

				return FALLBACK_INFRA_ERROR
			}

			currentOrganizationId = orgByHostRes.data.organizationId
		} else if (params.organizationId) {
			const orgByIdRes = await getOrganizationByIdService({ organizationId: params.organizationId })
			if (orgByIdRes.success === false) {
				if (orgByIdRes.code === "org_not_found") {
					return {
						success: false,
						message: MSG_ORG_NOT_FOUND,
						code: "org_not_found"
					}
				}

				return FALLBACK_INFRA_ERROR
			}

			currentOrganizationId = orgByIdRes.data.organization.id
		}

		if (!currentOrganizationId) {
			return {
				success: false,
				message: MSG_ORG_NOT_FOUND,
				code: "org_not_found"
			}
		}

		// ============================================================
		// 2) Carregar metadados da survey e validar acesso de resposta
		//
		// Possibilidades:
		// - survey inexistente / outro tenant => survey_not_found
		// - survey fora do estado/janela permitida => not_allowed
		// - survey privada sem membership ativo => not_allowed
		// - anonimato proibido => not_allowed
		// - resposta pública identificada sem snapshot manual => invalid_answers
		// ============================================================
		const surveyRes = await findSurveyByIdAdminService({ surveyId: params.surveyId })
		if (surveyRes.success === false) {
			if (surveyRes.code === "survey_not_found") {
				return {
					success: false,
					message: MSG_SURVEY_NOT_FOUND,
					code: "survey_not_found"
				}
			}

			return FALLBACK_INFRA_ERROR
		}

		const survey = surveyRes.data.survey

		if (survey.organization_id !== currentOrganizationId) {
			return {
				success: false,
				message: MSG_SURVEY_NOT_FOUND,
				code: "survey_not_found"
			}
		}

		if (!isSurveyAcceptingResponses(survey)) {
			return {
				success: false,
				message: MSG_NOT_ALLOWED,
				code: "not_allowed"
			}
		}

		if (survey.visibility === "private") {
			if (!authUserId) {
				return {
					success: false,
					message: MSG_NOT_ALLOWED,
					code: "not_allowed"
				}
			}

			const membershipRes = await isUserMemberOfOrganizationService({
				organizationId: currentOrganizationId,
				userId: authUserId
			})
			if (membershipRes.success === false) {
				return FALLBACK_INFRA_ERROR
			}

			if (membershipRes.data.isActive === false) {
				return {
					success: false,
					message: MSG_NOT_ALLOWED,
					code: "not_allowed"
				}
			}
		}

		if (isAnonymousAnswer && !survey.accept_anonymous_answers) {
			return {
				success: false,
				message: MSG_NOT_ALLOWED,
				code: "not_allowed"
			}
		}

		if (isPublicIdentifiedAnswer && (!respondentName || !respondentEmail || !respondentPhone)) {
			return {
				success: false,
				message: MSG_IDENTIFIED_PUBLIC_RESPONSE_REQUIRES_IDENTITY,
				code: "invalid_answers"
			}
		}

		// ============================================================
		// 3) Carregar questões da survey e validar respostas enviadas
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
		// 4) Calcular identificadores anti-duplicidade conforme contexto
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
		// 5) Persistir resposta e itens em uma única operação atômica
		//
		// Possibilidades:
		// - unique violation => already_answered
		// - erro infra => infra_error
		// - sucesso => finalizar com response criada
		// ============================================================
		const responseId = randomUUID()
		const submittedAt = new Date().toISOString()

		const submitRes = await submitSurveyResponseService({
			responseId,
			surveyId: params.surveyId,
			organizationId: survey.organization_id,
			respondentUserId: isAnonymousAnswer ? null : respondentUserId,
			respondentName: isPublicIdentifiedAnswer ? respondentName : null,
			respondentEmail: isPublicIdentifiedAnswer ? respondentEmail : null,
			respondentPhone: isPublicIdentifiedAnswer ? respondentPhone : null,
			isAnonymous: isAnonymousAnswer,
			responderFingerprintHash,
			submittedAt,
			answers: params.answers
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

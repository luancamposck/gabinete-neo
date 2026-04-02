import { getOrganizationIdByAppDomainService } from "@/modules/organizations/server/services/get-organization-id-by-app-domain.service"
import { findSurveyByIdAdminService } from "@/modules/surveys/server/services/find-survey-by-id-admin.service"
import { listSurveyQuestionsWithOptionsService } from "@/modules/surveys/server/services/list-survey-questions-with-options.service"
import { mapSurveyQuestionWithOptionsToDTO, mapSurveyRowToSurveyPublicDetailDTO, type SurveyPublicDetailDTO } from "@/modules/surveys/shared/types/dto"
import { getPublicSurveyAccessState } from "@/modules/surveys/shared/utils/get-public-survey-access-state"
import { getRequestHost } from "@/shared/http/get-request-host"
import type { OperationResponse } from "@/shared/types/operation-response.types"

type LoadPublicSurveyDetailUseCaseParams = {
	surveyId: string
}

type LoadPublicSurveyDetailUseCaseRes = {
	survey: SurveyPublicDetailDTO
}

type LoadPublicSurveyDetailUseCaseCode = "org_not_found" | "survey_not_found" | "survey_cross_tenant" | "survey_draft" | "survey_closed" | "survey_unavailable" | "infra_error"

const prefixLog = "[loadPublicSurveyDetailUseCase]:"

const MSG_SUCCESS = "Detalhes da pesquisa pública carregados com sucesso."
const MSG_ORG_NOT_FOUND = "Não foi possível identificar a organização deste domínio."
const MSG_SURVEY_NOT_FOUND = "Pesquisa não encontrada."
const MSG_SURVEY_CROSS_TENANT = "Esta pesquisa não pertence à organização atual."
const MSG_SURVEY_DRAFT = "Esta pesquisa ainda não foi publicada."
const MSG_SURVEY_CLOSED = "Esta pesquisa já foi encerrada."
const MSG_SURVEY_UNAVAILABLE = "Esta pesquisa não está disponível para respostas públicas no momento."
const MSG_INFRA_ERROR = "Não foi possível carregar os detalhes da pesquisa agora. Tente novamente em instantes."

const FALLBACK_INFRA_ERROR = {
	success: false,
	message: MSG_INFRA_ERROR,
	code: "infra_error"
} as const

export async function loadPublicSurveyDetailUseCase(params: LoadPublicSurveyDetailUseCaseParams): OperationResponse<LoadPublicSurveyDetailUseCaseRes, LoadPublicSurveyDetailUseCaseCode> {
	try {
		// ============================================================
		// 0) Resolver host atual
		//
		// Possibilidades:
		// - host ausente => org_not_found
		// - host presente => seguir fluxo
		// ============================================================
		const host = await getRequestHost()
		if (!host) {
			return {
				success: false,
				message: MSG_ORG_NOT_FOUND,
				code: "org_not_found"
			}
		}

		// ============================================================
		// 1) Resolver organização pelo domínio atual
		//
		// Possibilidades:
		// - org não encontrada => org_not_found
		// - erro técnico => infra_error
		// - org encontrada => seguir fluxo
		// ============================================================
		const orgRes = await getOrganizationIdByAppDomainService({ appDomain: host })
		if (orgRes.success === false) {
			if (orgRes.code === "org_not_found") {
				return {
					success: false,
					message: MSG_ORG_NOT_FOUND,
					code: "org_not_found"
				}
			}

			return FALLBACK_INFRA_ERROR
		}

		// ============================================================
		// 2) Carregar metadados da survey ignorando RLS pública
		//
		// Possibilidades:
		// - survey inexistente => survey_not_found
		// - erro técnico => infra_error
		// - survey encontrada => seguir validações de tenant/estado
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

		// ============================================================
		// 3) Validar pertencimento ao tenant e elegibilidade pública
		//
		// Possibilidades:
		// - survey de outro tenant => survey_cross_tenant
		// - survey draft => survey_draft
		// - survey closed => survey_closed
		// - survey privada / fora da janela => survey_unavailable
		// - survey pública publicada e disponível => seguir fluxo
		// ============================================================
		if (survey.organization_id !== orgRes.data.organizationId) {
			return {
				success: false,
				message: MSG_SURVEY_CROSS_TENANT,
				code: "survey_cross_tenant"
			}
		}

		const accessState = getPublicSurveyAccessState({ survey })
		if (accessState === "draft") {
			return {
				success: false,
				message: MSG_SURVEY_DRAFT,
				code: "survey_draft"
			}
		}

		if (accessState === "closed") {
			return {
				success: false,
				message: MSG_SURVEY_CLOSED,
				code: "survey_closed"
			}
		}

		if (accessState === "unavailable") {
			return {
				success: false,
				message: MSG_SURVEY_UNAVAILABLE,
				code: "survey_unavailable"
			}
		}

		// ============================================================
		// 4) Carregar questões e opções ordenadas da survey
		//
		// Possibilidades:
		// - erro técnico ao listar questões => infra_error
		// - sucesso => montar DTO público detalhado
		// ============================================================
		const questionsRes = await listSurveyQuestionsWithOptionsService({ surveyId: survey.id })
		if (questionsRes.success === false) {
			return FALLBACK_INFRA_ERROR
		}

		return {
			success: true,
			message: MSG_SUCCESS,
			data: {
				survey: mapSurveyRowToSurveyPublicDetailDTO({
					survey,
					questions: questionsRes.data.questions.map(mapSurveyQuestionWithOptionsToDTO)
				})
			}
		}
	} catch (error) {
		console.error(`${prefixLog} unexpected error:`, error)
		return FALLBACK_INFRA_ERROR
	}
}

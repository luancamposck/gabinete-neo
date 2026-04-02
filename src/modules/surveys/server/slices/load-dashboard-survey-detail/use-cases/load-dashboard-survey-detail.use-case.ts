import { getCurrentAuthUserService } from "@/modules/auth/server/services/get-current-auth-user.service"
import { isUserMemberOfOrganizationService } from "@/modules/organizations/memberships/server/services/is-user-member-of-organization.service"
import { getOrganizationIdByAppDomainService } from "@/modules/organizations/server/services/get-organization-id-by-app-domain.service"
import { findSurveyByIdService } from "@/modules/surveys/server/services/find-survey-by-id.service"
import { listSurveyQuestionsWithOptionsService } from "@/modules/surveys/server/services/list-survey-questions-with-options.service"
import { mapSurveyQuestionWithOptionsToDTO, mapSurveyRowToSurveyDetailDTO, type SurveyDetailDTO } from "@/modules/surveys/shared/types/dto"
import { getRequestHost } from "@/shared/http/get-request-host"
import type { OperationResponse } from "@/shared/types/operation-response.types"

type LoadDashboardSurveyDetailUseCaseParams = {
	surveyId: string
}

type LoadDashboardSurveyDetailUseCaseRes = {
	survey: SurveyDetailDTO
}

type LoadDashboardSurveyDetailUseCaseCode = "unauthenticated" | "org_not_found" | "not_member" | "survey_not_found" | "infra_error"

const prefixLog = "[loadDashboardSurveyDetailUseCase]:"

const MSG_SUCCESS = "Detalhes da pesquisa do dashboard carregados com sucesso."
const MSG_UNAUTHENTICATED = "Você precisa estar autenticado para acessar a pesquisa no dashboard."
const MSG_ORG_NOT_FOUND = "Não foi possível identificar a organização deste domínio."
const MSG_NOT_MEMBER = "Você precisa ter vínculo ativo com essa organização para acessar a pesquisa."
const MSG_SURVEY_NOT_FOUND = "Pesquisa não encontrada para o dashboard atual."
const MSG_INFRA_ERROR = "Não foi possível carregar os detalhes da pesquisa do dashboard. Tente novamente em instantes."

const FALLBACK_INFRA_ERROR = {
	success: false,
	message: MSG_INFRA_ERROR,
	code: "infra_error"
} as const

export async function loadDashboardSurveyDetailUseCase(params: LoadDashboardSurveyDetailUseCaseParams): OperationResponse<LoadDashboardSurveyDetailUseCaseRes, LoadDashboardSurveyDetailUseCaseCode> {
	try {
		// ============================================================
		// 0) Obter usuário autenticado
		//
		// Possibilidades:
		// - sem user => unauthenticated
		// - erro técnico => infra_error
		// - com user => seguir fluxo
		// ============================================================
		const authRes = await getCurrentAuthUserService()
		if (authRes.success === false) {
			if (authRes.code === "unauthenticated") {
				return {
					success: false,
					message: MSG_UNAUTHENTICATED,
					code: "unauthenticated"
				}
			}

			return FALLBACK_INFRA_ERROR
		}

		const userId = authRes.data.user.id

		// ============================================================
		// 1) Resolver host e tenant atual
		//
		// Possibilidades:
		// - host ausente => org_not_found
		// - org não encontrada => org_not_found
		// - erro técnico => infra_error
		// - org encontrada => seguir fluxo
		// ============================================================
		const host = await getRequestHost()
		if (!host) {
			return {
				success: false,
				message: MSG_ORG_NOT_FOUND,
				code: "org_not_found"
			}
		}

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

		const organizationId = orgRes.data.organizationId

		// ============================================================
		// 2) Garantir membership ativo na organização atual
		//
		// Possibilidades:
		// - erro técnico => infra_error
		// - sem membership ativo => not_member
		// - membership ativo => seguir fluxo
		// ============================================================
		const membershipRes = await isUserMemberOfOrganizationService({ organizationId, userId })
		if (membershipRes.success === false) {
			console.error(`${prefixLog} membership check failed:`, membershipRes.message)
			return FALLBACK_INFRA_ERROR
		}

		if (membershipRes.data.isActive === false) {
			return {
				success: false,
				message: MSG_NOT_MEMBER,
				code: "not_member"
			}
		}

		// ============================================================
		// 3) Carregar survey legível no tenant atual
		//
		// Possibilidades:
		// - survey não legível / inexistente => survey_not_found
		// - erro técnico => infra_error
		// - survey encontrada => seguir fluxo
		// ============================================================
		const surveyRes = await findSurveyByIdService({
			organizationId,
			surveyId: params.surveyId
		})
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

		// ============================================================
		// 4) Carregar questões e opções ordenadas da survey
		//
		// Possibilidades:
		// - erro técnico => infra_error
		// - sucesso => retornar DTO detalhado
		// ============================================================
		const questionsRes = await listSurveyQuestionsWithOptionsService({ surveyId: surveyRes.data.survey.id })
		if (questionsRes.success === false) {
			return FALLBACK_INFRA_ERROR
		}

		return {
			success: true,
			message: MSG_SUCCESS,
			data: {
				survey: mapSurveyRowToSurveyDetailDTO({
					survey: surveyRes.data.survey,
					questions: questionsRes.data.questions.map(mapSurveyQuestionWithOptionsToDTO)
				})
			}
		}
	} catch (error) {
		console.error(`${prefixLog} unexpected error:`, error)
		return FALLBACK_INFRA_ERROR
	}
}

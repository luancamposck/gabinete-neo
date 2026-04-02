import { getCurrentAuthUserService } from "@/modules/auth/server/services/get-current-auth-user.service"
import { hasMembershipPermissionService } from "@/modules/auth/server/services/has-membership-permission.service"
import { PERMISSIONS } from "@/modules/auth/shared/permissions"
import { getMembershipByOrgAndUserIdWithRoleService } from "@/modules/organizations/memberships/server/services/get-membership-by-org-and-user-id-with-role.service"
import { getOrganizationByIdService } from "@/modules/organizations/server/services/get-organization-by-id.service"
import { getOrganizationIdByAppDomainService } from "@/modules/organizations/server/services/get-organization-id-by-app-domain.service"
import { countSurveyResponsesService } from "@/modules/surveys/server/services/count-survey-responses.service"
import { findSurveyByIdService } from "@/modules/surveys/server/services/find-survey-by-id.service"
import { listSurveyQuestionsWithOptionsService } from "@/modules/surveys/server/services/list-survey-questions-with-options.service"
import { mapSurveyQuestionWithOptionsToDTO, mapSurveyRowToSurveyDetailDTO, type SurveyDetailDTO } from "@/modules/surveys/shared/types/dto"
import { getRequestHost } from "@/shared/http/get-request-host"
import type { OperationResponse } from "@/shared/types/operation-response.types"

type GetManageSurveyContextUseCaseParams = {
	surveyId: string
}

type GetManageSurveyContextUseCaseRes = {
	organization: {
		id: string
		name: string
	}
	survey: SurveyDetailDTO
	isStructureLocked: boolean
}

type GetManageSurveyContextUseCaseCode = "unauthenticated" | "org_not_found" | "not_allowed" | "survey_not_found" | "infra_error"

const prefixLog = "[getManageSurveyContextUseCase]:"

const MSG_SUCCESS = "Contexto de gestão da pesquisa carregado com sucesso."
const MSG_UNAUTHENTICATED = "Você precisa estar autenticado para gerenciar pesquisas."
const MSG_ORG_NOT_FOUND = "Não foi possível identificar a organização deste domínio."
const MSG_NOT_ALLOWED = "Você não tem permissão para gerenciar pesquisas nesta organização."
const MSG_SURVEY_NOT_FOUND = "Pesquisa não encontrada para edição no dashboard."
const MSG_INFRA_ERROR = "Não foi possível carregar a tela de gestão da pesquisa. Tente novamente em instantes."

const FALLBACK_INFRA_ERROR = {
	success: false,
	message: MSG_INFRA_ERROR,
	code: "infra_error"
} as const

function isOwnerRole(roleName: string) {
	return roleName.trim().toUpperCase() === "OWNER"
}

export async function getManageSurveyContextUseCase(params: GetManageSurveyContextUseCaseParams): OperationResponse<GetManageSurveyContextUseCaseRes, GetManageSurveyContextUseCaseCode> {
	try {
		// ============================================================
		// 0) Obter usuário autenticado
		//
		// Possibilidades:
		// - sem sessão => unauthenticated
		// - erro técnico => infra_error
		// - autenticado => seguir fluxo
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
		// 2) Validar membership ativo e permissão de gestão
		//
		// Possibilidades:
		// - sem membership ou membership inativa => not_allowed
		// - sem permissão surveys.manage fora de OWNER => not_allowed
		// - erro técnico => infra_error
		// - autorizado => seguir fluxo
		// ============================================================
		const membershipRes = await getMembershipByOrgAndUserIdWithRoleService({
			organizationId,
			userId
		})
		if (membershipRes.success === false) {
			if (membershipRes.code === "membership_not_found") {
				return {
					success: false,
					message: MSG_NOT_ALLOWED,
					code: "not_allowed"
				}
			}

			return FALLBACK_INFRA_ERROR
		}

		if (!membershipRes.data.isActive) {
			return {
				success: false,
				message: MSG_NOT_ALLOWED,
				code: "not_allowed"
			}
		}

		if (!isOwnerRole(membershipRes.data.roleName)) {
			const permissionRes = await hasMembershipPermissionService({
				organizationId,
				userId,
				permissionKey: PERMISSIONS.SURVEYS_MANAGE
			})
			if (permissionRes.success === false) {
				return FALLBACK_INFRA_ERROR
			}

			if (!permissionRes.data.allowed) {
				return {
					success: false,
					message: MSG_NOT_ALLOWED,
					code: "not_allowed"
				}
			}
		}

		// ============================================================
		// 3) Carregar organização e survey alvo
		//
		// Possibilidades:
		// - organização não encontrada => org_not_found
		// - survey inexistente => survey_not_found
		// - erro técnico => infra_error
		// - ambos encontrados => seguir fluxo
		// ============================================================
		const [organizationRes, surveyRes] = await Promise.all([getOrganizationByIdService({ organizationId }), findSurveyByIdService({ organizationId, surveyId: params.surveyId })])

		if (organizationRes.success === false) {
			if (organizationRes.code === "org_not_found") {
				return {
					success: false,
					message: MSG_ORG_NOT_FOUND,
					code: "org_not_found"
				}
			}

			return FALLBACK_INFRA_ERROR
		}

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
		// 4) Carregar estrutura e detectar lock pós-resposta
		//
		// Possibilidades:
		// - erro técnico => infra_error
		// - sucesso => retornar survey detalhada e lock state
		// ============================================================
		const [questionsRes, responsesRes] = await Promise.all([listSurveyQuestionsWithOptionsService({ surveyId: params.surveyId }), countSurveyResponsesService({ surveyId: params.surveyId })])

		if (questionsRes.success === false || responsesRes.success === false) {
			return FALLBACK_INFRA_ERROR
		}

		return {
			success: true,
			message: MSG_SUCCESS,
			data: {
				organization: {
					id: organizationRes.data.organization.id,
					name: organizationRes.data.organization.name
				},
				survey: mapSurveyRowToSurveyDetailDTO({
					survey: surveyRes.data.survey,
					questions: questionsRes.data.questions.map(mapSurveyQuestionWithOptionsToDTO)
				}),
				isStructureLocked: responsesRes.data.count > 0
			}
		}
	} catch (error) {
		console.error(`${prefixLog} unexpected error:`, error)
		return FALLBACK_INFRA_ERROR
	}
}

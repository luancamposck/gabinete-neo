import { getCurrentAuthUserService } from "@/modules/auth/server/services/get-current-auth-user.service"
import { hasMembershipPermissionService } from "@/modules/auth/server/services/has-membership-permission.service"
import { PERMISSIONS } from "@/modules/auth/shared/permissions"
import { getMembershipByOrgAndUserIdWithRoleService } from "@/modules/organizations/memberships/server/services/get-membership-by-org-and-user-id-with-role.service"
import { getOrganizationByIdService } from "@/modules/organizations/server/services/get-organization-by-id.service"
import { countSurveyResponsesAdminService } from "@/modules/surveys/server/services/count-survey-responses-admin.service"
import { findSurveyByIdService } from "@/modules/surveys/server/services/find-survey-by-id.service"
import { loadSurveyResultsService } from "@/modules/surveys/server/services/load-survey-results.service"
import type { SurveyResultsDTO } from "@/modules/surveys/shared/types/dto"
import type { OperationResponse } from "@/shared/types/operation-response.types"

type LoadSurveyResultsUseCaseParams = {
	organizationId: string
	surveyId: string
}

type LoadSurveyResultsUseCaseRes = {
	results: SurveyResultsDTO
}

type LoadSurveyResultsUseCaseCode = "unauthenticated" | "not_allowed" | "organization_not_found" | "survey_not_found" | "infra_error"

const prefixLog = "[loadSurveyResultsUseCase]:"
const MANAGE_SURVEYS_PERMISSION_KEY = PERMISSIONS.SURVEYS_MANAGE

const MSG_SUCCESS = "Resultados da pesquisa carregados com sucesso."
const MSG_UNAUTHENTICATED = "Você precisa estar autenticado para visualizar os resultados da pesquisa."
const MSG_NOT_ALLOWED = "Você não tem permissão para visualizar os resultados desta pesquisa."
const MSG_ORGANIZATION_NOT_FOUND = "Organização não encontrada."
const MSG_SURVEY_NOT_FOUND = "Pesquisa não encontrada."
const MSG_INFRA_ERROR = "Não foi possível carregar os resultados da pesquisa no momento."

const FALLBACK_INFRA_ERROR = { success: false, message: MSG_INFRA_ERROR, code: "infra_error" } as const
const isOwnerRole = (roleName: string) => roleName.trim().toUpperCase() === "OWNER"

export async function loadSurveyResultsUseCase(params: LoadSurveyResultsUseCaseParams): OperationResponse<LoadSurveyResultsUseCaseRes, LoadSurveyResultsUseCaseCode> {
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

		// ============================================================
		// 1) Validar existência da organização
		//
		// Possibilidades:
		// - organização inexistente => organization_not_found
		// - erro técnico => infra_error
		// - organização encontrada => seguir fluxo
		// ============================================================
		const organizationRes = await getOrganizationByIdService({ organizationId: params.organizationId })
		if (organizationRes.success === false) {
			if (organizationRes.code === "org_not_found") {
				return {
					success: false,
					message: MSG_ORGANIZATION_NOT_FOUND,
					code: "organization_not_found"
				}
			}

			return FALLBACK_INFRA_ERROR
		}

		// ============================================================
		// 2) Validar membership ativo e autorização de manager
		//
		// Possibilidades:
		// - sem membership / membership inativo => not_allowed
		// - erro técnico => infra_error
		// - OWNER ou membro com surveys.manage => seguir fluxo
		// ============================================================
		const membershipRes = await getMembershipByOrgAndUserIdWithRoleService({
			organizationId: params.organizationId,
			userId: authRes.data.user.id
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
				organizationId: params.organizationId,
				userId: authRes.data.user.id,
				permissionKey: MANAGE_SURVEYS_PERMISSION_KEY
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
		// 3) Garantir que a survey pertence à organização informada
		//
		// Possibilidades:
		// - survey inexistente / fora da organização => survey_not_found
		// - erro técnico => infra_error
		// - survey válida => seguir fluxo
		// ============================================================
		const surveyRes = await findSurveyByIdService({
			organizationId: params.organizationId,
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
		// 4) Carregar agregados por questão e total de respostas
		//
		// Possibilidades:
		// - erro técnico em qualquer leitura => infra_error
		// - sucesso => retornar DTO agregado para choice/checkbox/ranking
		// ============================================================
		const [resultsRes, totalResponsesRes] = await Promise.all([loadSurveyResultsService({ surveyId: params.surveyId }), countSurveyResponsesAdminService({ surveyId: params.surveyId })])

		if (resultsRes.success === false || totalResponsesRes.success === false) {
			return FALLBACK_INFRA_ERROR
		}

		return {
			success: true,
			message: MSG_SUCCESS,
			data: {
				results: {
					surveyId: surveyRes.data.survey.id,
					totalResponses: totalResponsesRes.data.count,
					questions: resultsRes.data.questions
				}
			}
		}
	} catch (error) {
		console.error(`${prefixLog} unexpected error:`, error)
		return FALLBACK_INFRA_ERROR
	}
}

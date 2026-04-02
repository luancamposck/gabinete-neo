import { getCurrentAuthUserService } from "@/modules/auth/server/services/get-current-auth-user.service"
import { hasMembershipPermissionService } from "@/modules/auth/server/services/has-membership-permission.service"
import { PERMISSIONS } from "@/modules/auth/shared/permissions"
import { getMembershipByOrgAndUserIdWithRoleService } from "@/modules/organizations/memberships/server/services/get-membership-by-org-and-user-id-with-role.service"
import { getOrganizationByIdService } from "@/modules/organizations/server/services/get-organization-by-id.service"
import { countSurveyQuestionsService } from "@/modules/surveys/server/services/count-survey-questions.service"
import { findSurveyByIdService } from "@/modules/surveys/server/services/find-survey-by-id.service"
import { publishSurveyService } from "@/modules/surveys/server/services/publish-survey.service"
import type { SurveyRow, SurveyStatus } from "@/modules/surveys/shared/types/db"
import type { OperationResponse } from "@/shared/types/operation-response.types"

type ErrorCodes = "unauthenticated" | "not_allowed" | "organization_not_found" | "survey_not_found" | "invalid_publication_state" | "min_questions_required" | "infra_error"

const prefixLog = "[publishSurveyUseCase]:"
const MANAGE_SURVEYS_PERMISSION_KEY = PERMISSIONS.SURVEYS_MANAGE

const MSG_SUCCESS = "Pesquisa publicada com sucesso."
const MSG_UNAUTHENTICATED = "Você precisa estar autenticado para publicar pesquisas."
const MSG_NOT_ALLOWED = "Você não tem permissão para publicar pesquisas nesta organização."
const MSG_ORGANIZATION_NOT_FOUND = "Organização não encontrada."
const MSG_SURVEY_NOT_FOUND = "Pesquisa não encontrada."
const MSG_INVALID_PUBLICATION_STATE = "A pesquisa só pode ser publicada quando estiver em rascunho."
const MSG_MIN_QUESTIONS_REQUIRED = "A pesquisa precisa de pelo menos uma pergunta antes da publicação."
const MSG_INFRA_ERROR = "Não foi possível publicar a pesquisa no momento."

const FALLBACK_INFRA_ERROR = { success: false, message: MSG_INFRA_ERROR, code: "infra_error" } as const
const isOwnerRole = (roleName: string) => roleName.trim().toUpperCase() === "OWNER"
const isDraftSurveyStatus = (status: SurveyStatus) => status === "draft"

export async function publishSurveyUseCase(params: { organizationId: string; surveyId: string }): OperationResponse<{ survey: SurveyRow }, ErrorCodes> {
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
				return { success: false, message: MSG_UNAUTHENTICATED, code: "unauthenticated" }
			}

			return FALLBACK_INFRA_ERROR
		}

		// ============================================================
		// 1) Garantir existência da organização
		//
		// Possibilidades:
		// - organização inexistente => organization_not_found
		// - erro técnico => infra_error
		// - organização encontrada => seguir fluxo
		// ============================================================
		const organizationRes = await getOrganizationByIdService({ organizationId: params.organizationId })
		if (organizationRes.success === false) {
			if (organizationRes.code === "org_not_found") {
				return { success: false, message: MSG_ORGANIZATION_NOT_FOUND, code: "organization_not_found" }
			}

			return FALLBACK_INFRA_ERROR
		}

		// ============================================================
		// 2) Validar membership ativo do usuário
		//
		// Possibilidades:
		// - sem membership => not_allowed
		// - membership inativo => not_allowed
		// - erro técnico => infra_error
		// - membership ativo => seguir fluxo
		// ============================================================
		const membershipRes = await getMembershipByOrgAndUserIdWithRoleService({
			organizationId: params.organizationId,
			userId: authRes.data.user.id
		})
		if (membershipRes.success === false) {
			if (membershipRes.code === "membership_not_found") {
				return { success: false, message: MSG_NOT_ALLOWED, code: "not_allowed" }
			}

			return FALLBACK_INFRA_ERROR
		}

		if (!membershipRes.data.isActive) {
			return { success: false, message: MSG_NOT_ALLOWED, code: "not_allowed" }
		}

		// ============================================================
		// 3) Validar permissão de gerenciamento quando não for OWNER
		//
		// Possibilidades:
		// - sem permissão => not_allowed
		// - erro técnico => infra_error
		// - com permissão => seguir fluxo
		// ============================================================
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
				return { success: false, message: MSG_NOT_ALLOWED, code: "not_allowed" }
			}
		}

		// ============================================================
		// 4) Garantir existência da survey alvo
		//
		// Possibilidades:
		// - survey inexistente => survey_not_found
		// - erro técnico => infra_error
		// - survey encontrada => seguir fluxo
		// ============================================================
		const surveyRes = await findSurveyByIdService({ organizationId: params.organizationId, surveyId: params.surveyId })
		if (surveyRes.success === false) {
			if (surveyRes.code === "survey_not_found") {
				return { success: false, message: MSG_SURVEY_NOT_FOUND, code: "survey_not_found" }
			}

			return FALLBACK_INFRA_ERROR
		}

		// ============================================================
		// 5) Validar estado atual da survey antes da publicação
		//
		// Possibilidades:
		// - status diferente de draft => invalid_publication_state
		// - draft => seguir para validar perguntas mínimas
		// ============================================================
		if (!isDraftSurveyStatus(surveyRes.data.survey.status)) {
			return {
				success: false,
				message: MSG_INVALID_PUBLICATION_STATE,
				code: "invalid_publication_state"
			}
		}

		// ============================================================
		// 6) Validar regra de perguntas mínimas para publicação
		//
		// Possibilidades:
		// - erro técnico => infra_error
		// - sem perguntas => min_questions_required
		// - com perguntas => seguir publicação
		// ============================================================
		const questionsRes = await countSurveyQuestionsService({ surveyId: params.surveyId })
		if (questionsRes.success === false) {
			return FALLBACK_INFRA_ERROR
		}

		if (questionsRes.data.count < 1) {
			return { success: false, message: MSG_MIN_QUESTIONS_REQUIRED, code: "min_questions_required" }
		}

		// ============================================================
		// 7) Publicar survey (status = published)
		//
		// Possibilidades:
		// - erro técnico => infra_error
		// - sucesso => retornar survey publicada
		// ============================================================
		const publishRes = await publishSurveyService(params)
		if (publishRes.success === false) {
			return FALLBACK_INFRA_ERROR
		}

		return {
			success: true,
			message: MSG_SUCCESS,
			data: {
				survey: publishRes.data.survey
			}
		}
	} catch (error) {
		console.error(`${prefixLog} unexpected error:`, error)
		return FALLBACK_INFRA_ERROR
	}
}

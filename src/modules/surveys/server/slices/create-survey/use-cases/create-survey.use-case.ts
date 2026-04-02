import { getCurrentAuthUserService } from "@/modules/auth/server/services/get-current-auth-user.service"
import { hasMembershipPermissionService } from "@/modules/auth/server/services/has-membership-permission.service"
import { PERMISSIONS } from "@/modules/auth/shared/permissions"
import { getMembershipByOrgAndUserIdWithRoleService } from "@/modules/organizations/memberships/server/services/get-membership-by-org-and-user-id-with-role.service"
import { getOrganizationByIdService } from "@/modules/organizations/server/services/get-organization-by-id.service"
import { createSurveyWithQuestionsService } from "@/modules/surveys/server/services/create-survey-with-questions.service"
import type { SurveyRow } from "@/modules/surveys/shared/types/db"
import type { SurveyQuestionSchemaData } from "@/modules/surveys/shared/validations/survey-question.schema"
import type { OperationResponse } from "@/shared/types/operation-response.types"

type CreateSurveyUseCaseParams = {
	organizationId: string
	title: string
	description: string | null
	visibility: "public" | "private"
	acceptAnonymousAnswers: boolean
	startsAt: string | null
	endsAt: string | null
	questions: SurveyQuestionSchemaData[]
}

type ErrorCodes = "unauthenticated" | "not_allowed" | "organization_not_found" | "infra_error"

const prefixLog = "[createSurveyUseCase]:"
const MANAGE_SURVEYS_PERMISSION_KEY = PERMISSIONS.SURVEYS_MANAGE

const MSG_SUCCESS = "Pesquisa criada com sucesso."
const MSG_UNAUTHENTICATED = "Você precisa estar autenticado para criar pesquisas."
const MSG_NOT_ALLOWED = "Você não tem permissão para criar pesquisas nesta organização."
const MSG_ORGANIZATION_NOT_FOUND = "Organização não encontrada."
const MSG_INFRA_ERROR = "Não foi possível criar a pesquisa no momento."

const FALLBACK_INFRA_ERROR = { success: false, message: MSG_INFRA_ERROR, code: "infra_error" } as const
const isOwnerRole = (roleName: string) => roleName.trim().toUpperCase() === "OWNER"

export async function createSurveyUseCase(params: CreateSurveyUseCaseParams): OperationResponse<{ survey: SurveyRow }, ErrorCodes> {
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
				return { success: false, message: MSG_ORGANIZATION_NOT_FOUND, code: "organization_not_found" }
			}

			return FALLBACK_INFRA_ERROR
		}

		// ============================================================
		// 2) Validar membership e permissão
		//
		// Possibilidades:
		// - sem membership / membership inativo => not_allowed
		// - erro técnico em membership/permissão => infra_error
		// - usuário OWNER ou com permissão => seguir fluxo
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
		// 3) Criar survey e persistir estrutura de questões/opções
		//
		// Possibilidades:
		// - erro técnico na persistência atômica => infra_error
		// - survey criada com ou sem questões/opções => sucesso
		// - qualquer falha intermediária deve abortar toda a transação
		// ============================================================
		const createRes = await createSurveyWithQuestionsService({
			organizationId: params.organizationId,
			createdByUserId: authRes.data.user.id,
			title: params.title,
			description: params.description,
			visibility: params.visibility,
			acceptAnonymousAnswers: params.acceptAnonymousAnswers,
			startsAt: params.startsAt,
			endsAt: params.endsAt,
			questions: params.questions
		})
		if (createRes.success === false) {
			return FALLBACK_INFRA_ERROR
		}

		return {
			success: true,
			message: MSG_SUCCESS,
			data: {
				survey: createRes.data.survey
			}
		}
	} catch (error) {
		console.error(`${prefixLog} unexpected error:`, error)
		return FALLBACK_INFRA_ERROR
	}
}

import { getCurrentAuthUserService } from "@/modules/auth/server/services/get-current-auth-user.service"
import { hasMembershipPermissionService } from "@/modules/auth/server/services/has-membership-permission.service"
import { PERMISSIONS } from "@/modules/auth/shared/permissions"
import { getMembershipByOrgAndUserIdWithRoleService } from "@/modules/organizations/memberships/server/services/get-membership-by-org-and-user-id-with-role.service"
import { getOrganizationByIdService } from "@/modules/organizations/server/services/get-organization-by-id.service"
import { deleteSurveyQuestionsBySurveyIdService } from "@/modules/surveys/server/services/delete-survey-questions-by-survey-id.service"
import { findSurveyByIdService } from "@/modules/surveys/server/services/find-survey-by-id.service"
import { insertSurveyQuestionOptionsService } from "@/modules/surveys/server/services/insert-survey-question-options.service"
import { insertSurveyQuestionsService } from "@/modules/surveys/server/services/insert-survey-questions.service"
import { updateSurveyService } from "@/modules/surveys/server/services/update-survey.service"
import type { SurveyRow } from "@/modules/surveys/shared/types/db"
import type { SurveyQuestionSchemaData } from "@/modules/surveys/shared/validations/survey-question.schema"
import type { OperationResponse } from "@/shared/types/operation-response.types"
import type { Json, TablesInsert } from "@/shared/types/supabase"

type UpdateSurveyUseCaseParams = {
	organizationId: string
	surveyId: string
	updates: {
		title?: string
		description?: string | null
		visibility?: "public" | "private"
		acceptAnonymousAnswers?: boolean
		startsAt?: string | null
		endsAt?: string | null
		questions?: SurveyQuestionSchemaData[]
	}
}

type ErrorCodes = "unauthenticated" | "not_allowed" | "organization_not_found" | "survey_not_found" | "infra_error"

const prefixLog = "[updateSurveyUseCase]:"
const MANAGE_SURVEYS_PERMISSION_KEY = PERMISSIONS.ORG_ADMIN_UPDATE

const MSG_SUCCESS = "Pesquisa atualizada com sucesso."
const MSG_UNAUTHENTICATED = "Você precisa estar autenticado para editar pesquisas."
const MSG_NOT_ALLOWED = "Você não tem permissão para editar pesquisas nesta organização."
const MSG_ORGANIZATION_NOT_FOUND = "Organização não encontrada."
const MSG_SURVEY_NOT_FOUND = "Pesquisa não encontrada."
const MSG_INFRA_ERROR = "Não foi possível atualizar a pesquisa no momento."

const FALLBACK_INFRA_ERROR = { success: false, message: MSG_INFRA_ERROR, code: "infra_error" } as const
const isOwnerRole = (roleName: string) => roleName.trim().toUpperCase() === "OWNER"

export async function updateSurveyUseCase(params: UpdateSurveyUseCaseParams): OperationResponse<{ survey: SurveyRow }, ErrorCodes> {
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
		// 1) Garantir que organização e permissões são válidas
		//
		// Possibilidades:
		// - organização inexistente => organization_not_found
		// - sem membership / membership inativo / sem permissão => not_allowed
		// - erro técnico em serviços auxiliares => infra_error
		// - contexto autorizado => seguir fluxo
		// ============================================================
		const organizationRes = await getOrganizationByIdService({ organizationId: params.organizationId })
		if (organizationRes.success === false) {
			if (organizationRes.code === "org_not_found") {
				return { success: false, message: MSG_ORGANIZATION_NOT_FOUND, code: "organization_not_found" }
			}
			return FALLBACK_INFRA_ERROR
		}

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
		// 2) Garantir existência da survey e atualizar metadados
		//
		// Possibilidades:
		// - survey inexistente => survey_not_found
		// - erro técnico ao consultar/atualizar => infra_error
		// - survey encontrada + update ok => seguir fluxo
		// ============================================================
		const surveyRes = await findSurveyByIdService({ organizationId: params.organizationId, surveyId: params.surveyId })
		if (surveyRes.success === false) {
			if (surveyRes.code === "survey_not_found") {
				return { success: false, message: MSG_SURVEY_NOT_FOUND, code: "survey_not_found" }
			}
			return FALLBACK_INFRA_ERROR
		}

		const updateRes = await updateSurveyService(params)
		if (updateRes.success === false) {
			return FALLBACK_INFRA_ERROR
		}

		// ============================================================
		// 3) Sincronizar questões/opções quando informado no payload
		//
		// Possibilidades:
		// - questions ausente => manter estrutura atual
		// - questions informada => limpar + inserir novas questões/opções
		// - erro técnico em qualquer etapa => infra_error
		// ============================================================
		if (params.updates.questions) {
			const clearRes = await deleteSurveyQuestionsBySurveyIdService({ surveyId: params.surveyId })
			if (clearRes.success === false) {
				return FALLBACK_INFRA_ERROR
			}

			if (params.updates.questions.length > 0) {
				const questionsToInsert: TablesInsert<"survey_questions">[] = params.updates.questions.map((question, index) => ({
					survey_id: params.surveyId,
					title: question.title,
					description: question.description ?? null,
					type: question.type,
					required: question.required,
					position: index,
					config_json: (question.configJson ?? {}) as Json
				}))

				const questionsRes = await insertSurveyQuestionsService(questionsToInsert)
				if (questionsRes.success === false) {
					return FALLBACK_INFRA_ERROR
				}

				const optionsToInsert: TablesInsert<"survey_question_options">[] = []
				for (const [questionIndex, savedQuestion] of questionsRes.data.questions.entries()) {
					const source = params.updates.questions[questionIndex]
					for (const [optionIndex, option] of source.options.entries()) {
						optionsToInsert.push({
							question_id: savedQuestion.id,
							label: option.label,
							value: option.value,
							position: optionIndex
						})
					}
				}

				if (optionsToInsert.length > 0) {
					const optionsRes = await insertSurveyQuestionOptionsService(optionsToInsert)
					if (optionsRes.success === false) {
						return FALLBACK_INFRA_ERROR
					}
				}
			}
		}

		return {
			success: true,
			message: MSG_SUCCESS,
			data: {
				survey: updateRes.data.survey
			}
		}
	} catch (error) {
		console.error(`${prefixLog} unexpected error:`, error)
		return FALLBACK_INFRA_ERROR
	}
}

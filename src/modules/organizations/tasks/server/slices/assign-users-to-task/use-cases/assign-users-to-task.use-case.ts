import { getCurrentAuthUserService } from "@/modules/auth/server/services/get-current-auth-user.service"
import { isUserMemberOfOrganizationService } from "@/modules/organizations/memberships/server/services/is-user-member-of-organization.service"
import { getOrganizationIdByAppDomainAction } from "@/modules/organizations/server/slices/get-organization-id-by-app-domain/actions/get-organization-id-by-app-domain.action"
import { addUsersToTaskService } from "@/modules/organizations/tasks/server/services/add-users-to-task.service"
import { getRequestHost } from "@/shared/http/get-request-host"
import type { OperationResponse } from "@/shared/types/operation-reponse.types"

type AssignUsersToTaskUseCaseParams = {
	taskId: string
	userIds: string[]
}

type ErrorCodes = "unauthenticated" | "org_not_found" | "not_member" | "validation_error" | "infra_error"

const prefixLog = "[assignUsersToTaskUseCase]:"

const MSG_UNAUTHENTICATED = "Você precisa estar autenticado para continuar."
const MSG_ORG_NOT_FOUND = "Não foi possível identificar a organização deste domínio."
const MSG_NOT_MEMBER = "Você não possui acesso à constelação atual."
const MSG_VALIDATION_ERROR = "Selecione pelo menos um usuário para atribuir à tarefa."
const MSG_INFRA_ERROR = "Não foi possível preparar os dados. Tente novamente em instantes."

const FALLBACK_INFRA_ERROR = {
	success: false,
	message: MSG_INFRA_ERROR,
	code: "infra_error"
} as const

export async function assignUsersToTaskUseCase(params: AssignUsersToTaskUseCaseParams): OperationResponse<{ insertedCount: number }, ErrorCodes> {
	try {
		const { taskId, userIds } = params

		// Step 0: validação básica
		if (!taskId || !Array.isArray(userIds) || userIds.length === 0) {
			return {
				success: false,
				code: "validation_error",
				message: MSG_VALIDATION_ERROR
			}
		}

		// Step 1: autenticação
		const authRes = await getCurrentAuthUserService()
		if (authRes.success === false) {
			if (authRes.code === "unauthenticated") {
				return {
					success: false,
					code: "unauthenticated",
					message: MSG_UNAUTHENTICATED
				}
			}

			return FALLBACK_INFRA_ERROR
		}

		const currentUserId = authRes.data.user.id

		// Step 2: resolução do tenant
		const host = await getRequestHost()
		if (!host) {
			return {
				success: false,
				code: "org_not_found",
				message: MSG_ORG_NOT_FOUND
			}
		}

		const orgRes = await getOrganizationIdByAppDomainAction({ appDomain: host })
		if (orgRes.success === false) {
			if (orgRes.code === "org_not_found") {
				return {
					success: false,
					code: "org_not_found",
					message: MSG_ORG_NOT_FOUND
				}
			}

			return FALLBACK_INFRA_ERROR
		}

		const organizationId = orgRes.data.organizationId

		// Step 3: verificação de membership
		const membershipRes = await isUserMemberOfOrganizationService({
			organizationId,
			userId: currentUserId
		})

		if (membershipRes.success === false) {
			console.error(`${prefixLog} membership check failed:`, membershipRes.message)
			return FALLBACK_INFRA_ERROR
		}

		if (membershipRes.data.isMember === false) {
			return {
				success: false,
				code: "not_member",
				message: MSG_NOT_MEMBER
			}
		}

		// Step 4: atribuir usuários à tarefa
		const assignRes = await addUsersToTaskService({
			organizationId,
			taskId,
			userIds
		})

		if (assignRes.success === false) {
			console.error(`${prefixLog} assign users failed:`, assignRes.message)
			return FALLBACK_INFRA_ERROR
		}

		return {
			success: true,
			message: assignRes.message,
			data: {
				insertedCount: assignRes.data.insertedCount
			}
		}
	} catch (error) {
		console.error(`${prefixLog} unexpected error:`, error)
		return FALLBACK_INFRA_ERROR
	}
}

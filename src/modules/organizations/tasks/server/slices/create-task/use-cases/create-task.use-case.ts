import { getCurrentAuthUserService } from "@/modules/auth/server/services/get-current-auth-user.service"
import { isUserMemberOfOrganizationService } from "@/modules/organizations/memberships/server/services/is-user-member-of-organization.service"
import { getOrganizationIdByAppDomainAction } from "@/modules/organizations/server/slices/get-organization-id-by-app-domain/actions/get-organization-id-by-app-domain.action"
import { createOrganizationTaskService } from "@/modules/organizations/tasks/server/services/create-organization-task.service"
import { createOrganizationTaskSchemaServer } from "@/modules/organizations/tasks/shared/validations/create-organization-task.schema.server"
import { getRequestHost } from "@/shared/http/get-request-host"
import type { OperationResponse } from "@/shared/types/operation-response.types"

type CreateTaskUseCaseParams = {
	title: string
	description?: string | null
	dueDate?: Date | null
}

type ErrorCodes = "unauthenticated" | "org_not_found" | "not_member" | "validation_error" | "infra_error"

const prefixLog = "[createTaskUseCase]:"

const MSG_UNAUTHENTICATED = "Você precisa estar autenticado para criar uma tarefa."
const MSG_ORG_NOT_FOUND = "Não foi possível identificar a organização deste domínio."
const MSG_NOT_MEMBER = "Você não possui acesso à constelação atual."
const MSG_VALIDATION_ERROR = "Dados inválidos ao criar a tarefa. Verifique o título e a descrição."
const MSG_INFRA_ERROR = "Não foi possível preparar os dados. Tente novamente em instantes."

const FALLBACK_INFRA_ERROR = {
	success: false,
	message: MSG_INFRA_ERROR,
	code: "infra_error"
} as const

export async function createTaskUseCase(params: CreateTaskUseCaseParams): OperationResponse<{ taskId: string }, ErrorCodes> {
	try {
		// Step 0: autenticação
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

		// Step 1: resolução do tenant
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

		// Step 2: verificação de membership
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

		// Step 3: validação dos dados
		const parsed = createOrganizationTaskSchemaServer.safeParse(params)
		if (!parsed.success) {
			console.error(`${prefixLog} validation error:`, parsed.error)
			return {
				success: false,
				code: "validation_error",
				message: MSG_VALIDATION_ERROR
			}
		}

		const { title, description, dueDate } = parsed.data

		// Step 4: criação da tarefa
		const createRes = await createOrganizationTaskService({
			organizationId,
			title,
			description: description ?? null,
			createdByUserId: currentUserId,
			dueAt: dueDate ? dueDate.toISOString() : null
		})

		if (createRes.success === false) {
			console.error(`${prefixLog} create task failed:`, createRes.message)
			return FALLBACK_INFRA_ERROR
		}

		return {
			success: true,
			message: createRes.message,
			data: {
				taskId: createRes.data.taskId
			}
		}
	} catch (error) {
		console.error(`${prefixLog} unexpected error:`, error)
		return FALLBACK_INFRA_ERROR
	}
}

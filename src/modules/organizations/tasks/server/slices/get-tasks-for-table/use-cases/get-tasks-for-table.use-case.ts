import { getCurrentAuthUserService } from "@/modules/auth/server/services/get-current-auth-user.service"
import { isUserMemberOfOrganizationService } from "@/modules/organizations/memberships/server/services/is-user-member-of-organization.service"
import { getOrganizationIdByAppDomainAction } from "@/modules/organizations/server/slices/get-organization-id-by-app-domain/actions/get-organization-id-by-app-domain.action"
import type { OrganizationTaskWithCreator } from "@/modules/organizations/tasks/server/repos/list-organization-tasks-with-creator.admin.repo"
import { listOrganizationTasksWithCreatorService } from "@/modules/organizations/tasks/server/services/list-organization-tasks-with-creator.service"
import { getRequestHost } from "@/shared/http/get-request-host"
import type { OperationResponse } from "@/shared/types/operation-response.types"

type GetTasksForTableUseCaseRes = {
	organizationId: string
	tasks: OrganizationTaskWithCreator[]
}

type ErrorCodes = "unauthenticated" | "org_not_found" | "not_member" | "infra_error"

const prefixLog = "[getTasksForTableUseCase]:"

const MSG_UNAUTHENTICATED = "Você precisa estar autenticado para continuar."
const MSG_ORG_NOT_FOUND = "Não foi possível identificar a organização deste domínio."
const MSG_NOT_MEMBER = "Você não possui acesso à constelação atual."
const MSG_INFRA_ERROR = "Não foi possível preparar os dados. Tente novamente em instantes."

const FALLBACK_INFRA_ERROR = {
	success: false,
	message: MSG_INFRA_ERROR,
	code: "infra_error"
} as const

export async function getTasksForTableUseCase(): OperationResponse<GetTasksForTableUseCaseRes, ErrorCodes> {
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

		// Step 3: listar tarefas
		const tasksRes = await listOrganizationTasksWithCreatorService({ organizationId })

		if (tasksRes.success === false) {
			console.error(`${prefixLog} tasks load failed:`, tasksRes.message)
			return FALLBACK_INFRA_ERROR
		}

		return {
			success: true,
			message: tasksRes.message,
			data: {
				organizationId,
				tasks: tasksRes.data.tasks ?? []
			}
		}
	} catch (error) {
		console.error(`${prefixLog} unexpected error:`, error)
		return FALLBACK_INFRA_ERROR
	}
}

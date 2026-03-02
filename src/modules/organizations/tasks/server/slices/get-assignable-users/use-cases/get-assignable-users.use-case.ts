import { getCurrentAuthUserService } from "@/modules/auth/server/services/get-current-auth-user.service"
import type { OrganizationMemberWithUserProfileAndRole } from "@/modules/organizations/memberships/server/repos/list-organization-members-with-profile-and-role-by-organization-id.repo"
import { isUserMemberOfOrganizationService } from "@/modules/organizations/memberships/server/services/is-user-member-of-organization.service"
import { listOrganizationMembersWithProfileAndRoleByOrganizationIdService } from "@/modules/organizations/memberships/server/services/list-organization-members-with-profile-and-role-by-organization-id.service"
import { getOrganizationIdByAppDomainAction } from "@/modules/organizations/server/slices/get-organization-id-by-app-domain/actions/get-organization-id-by-app-domain.action"
import type { TaskAssignmentWithUser } from "@/modules/organizations/tasks/server/repos/list-task-assignments-with-user.admin.repo"
import { listTaskAssignmentsWithUserService } from "@/modules/organizations/tasks/server/services/list-task-assignments-with-user.service"
import { getRequestHost } from "@/shared/http/get-request-host"
import type { OperationResponse } from "@/shared/types/operation-response.types"

type GetAssignableUsersUseCaseRes = {
	members: OrganizationMemberWithUserProfileAndRole[]
	assignments: TaskAssignmentWithUser[]
}

type ErrorCodes = "unauthenticated" | "org_not_found" | "not_member" | "validation_error" | "infra_error"

const prefixLog = "[getAssignableUsersUseCase]:"

const MSG_UNAUTHENTICATED = "Você precisa estar autenticado para continuar."
const MSG_ORG_NOT_FOUND = "Não foi possível identificar a organização deste domínio."
const MSG_NOT_MEMBER = "Você não possui acesso à constelação atual."
const MSG_VALIDATION_ERROR = "Tarefa inválida para atribuição de usuários."
const MSG_INFRA_ERROR = "Não foi possível preparar os dados. Tente novamente em instantes."

const FALLBACK_INFRA_ERROR = {
	success: false,
	message: MSG_INFRA_ERROR,
	code: "infra_error"
} as const

export async function getAssignableUsersUseCase(params: { taskId: string }): OperationResponse<GetAssignableUsersUseCaseRes, ErrorCodes> {
	try {
		const { taskId } = params

		// Step 0: validação básica
		if (!taskId) {
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

		// Step 4: listar membros da organização
		const membersRes = await listOrganizationMembersWithProfileAndRoleByOrganizationIdService({
			organizationId
		})

		if (membersRes.success === false) {
			console.error(`${prefixLog} members load failed:`, membersRes.message)
			return FALLBACK_INFRA_ERROR
		}

		// Step 5: listar assignments existentes da task
		const assignmentsRes = await listTaskAssignmentsWithUserService({ taskId })

		if (assignmentsRes.success === false) {
			console.error(`${prefixLog} assignments load failed:`, assignmentsRes.message)
			return FALLBACK_INFRA_ERROR
		}

		return {
			success: true,
			message: "Dados de atribuição de tarefa carregados com sucesso.",
			data: {
				members: membersRes.data.organizationMembers ?? [],
				assignments: assignmentsRes.data.assignments ?? []
			}
		}
	} catch (error) {
		console.error(`${prefixLog} unexpected error:`, error)
		return FALLBACK_INFRA_ERROR
	}
}

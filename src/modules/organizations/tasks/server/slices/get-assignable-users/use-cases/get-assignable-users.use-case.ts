import { getCurrentAuthUserService } from "@/modules/auth/server/services/get-current-auth-user.service"
import type { OrganizationMemberWithUserProfileAndRole } from "@/modules/organizations/memberships/server/repos/list-organization-members-with-profile-and-role-by-organization-id.repo"
import { isUserMemberOfOrganizationService } from "@/modules/organizations/memberships/server/services/is-user-member-of-organization.service"
import { listOrganizationMembersWithProfileAndRoleByOrganizationIdService } from "@/modules/organizations/memberships/server/services/list-organization-members-with-profile-and-role-by-organization-id.service"
import { getOrganizationIdByAppDomainService } from "@/modules/organizations/server/services/get-organization-id-by-app-domain.service"
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

		// ============================================================
		// 0) Validação básica
		//
		// Possibilidades:
		// - taskId ausente => validation_error
		// - taskId válido => prossegue
		// ============================================================
		if (!taskId) {
			return {
				success: false,
				code: "validation_error",
				message: MSG_VALIDATION_ERROR
			}
		}

		// ============================================================
		// 1) Autenticação
		//
		// Possibilidades:
		// - sem user => unauthenticated
		// - erro técnico => infra_error
		// ============================================================
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

		// ============================================================
		// 2) Resolução do tenant
		//
		// Possibilidades:
		// - host ausente => org_not_found
		// - org não encontrada => org_not_found
		// - erro técnico => infra_error
		// ============================================================
		const host = await getRequestHost()
		if (!host) {
			return {
				success: false,
				code: "org_not_found",
				message: MSG_ORG_NOT_FOUND
			}
		}

		const orgRes = await getOrganizationIdByAppDomainService({ appDomain: host })
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

		// ============================================================
		// 3) Verificação de membership
		//
		// Possibilidades:
		// - erro técnico => infra_error
		// - não é membro => not_member
		// - é membro => ok
		// ============================================================
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

		// ============================================================
		// 4) Listar membros da organização
		//
		// Possibilidades:
		// - erro técnico => infra_error
		// - sucesso => lista de membros
		// ============================================================
		const membersRes = await listOrganizationMembersWithProfileAndRoleByOrganizationIdService({
			organizationId
		})

		if (membersRes.success === false) {
			console.error(`${prefixLog} members load failed:`, membersRes.message)
			return FALLBACK_INFRA_ERROR
		}

		// ============================================================
		// 5) Listar assignments existentes da task
		//
		// Possibilidades:
		// - erro técnico => infra_error
		// - sucesso => lista de assignments
		// ============================================================
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

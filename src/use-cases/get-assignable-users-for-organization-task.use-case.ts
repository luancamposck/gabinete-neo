// src/use-cases/get-assignable-users-for-organization-task.use-case.ts

import { getCurrentAuthUserService } from "@/services/auth/get-current-auth-user.service"
import { getOrganizationMembershipByUserIdService } from "@/services/organization-membership/get-organization-membership-by-user-id.service"
import { listOrganizationMembersByOrganizationIdService } from "@/services/organization-membership/list-organization-members-by-organization-id.service"
import { listOrganizationTaskAssignmentsWithUserByTaskIdService } from "@/services/organization-task-assignments/list-organization-task-assignments-with-user-by-task-id.service"
import type { OrganizationMemberWithUser } from "@/types/domain/organization/organization-member.types"
import type { OrganizationTaskAssignmentWithUser } from "@/types/domain/tasks/organization-task-assignments-with-user.types"
import type { OperationResponse } from "@/types/operation-response"

export async function getAssignableUsersForOrganizationTaskUseCase(params: { taskId: string }): Promise<OperationResponse<{ members: OrganizationMemberWithUser[]; assignments: OrganizationTaskAssignmentWithUser[] }>> {
	const { taskId } = params

	if (!taskId) {
		return {
			success: false,
			message: "Tarefa inválida para atribuição de usuários."
		}
	}

	try {
		// 1) Pegar usuário autenticado
		const getCurrentAuthUserServiceRes = await getCurrentAuthUserService()
		if (getCurrentAuthUserServiceRes.success === false) {
			return {
				success: false,
				message: getCurrentAuthUserServiceRes.message
			}
		}

		const userId = getCurrentAuthUserServiceRes.data.user.id

		// 2) Pegar membership do usuário (daqui vem o organizationId)
		const getOrganizationMembershipByUserIdServiceRes = await getOrganizationMembershipByUserIdService({
			userId
		})

		if (getOrganizationMembershipByUserIdServiceRes.success === false) {
			return {
				success: false,
				message: getOrganizationMembershipByUserIdServiceRes.message
			}
		}

		const membership = getOrganizationMembershipByUserIdServiceRes.data.organizationMemberships
		const organizationId = membership.organization_id

		// 3) Listar todos os membros da organização (membership + user)
		const listMembersServiceRes = await listOrganizationMembersByOrganizationIdService({
			organizationId
		})

		if (listMembersServiceRes.success === false || !listMembersServiceRes.data) {
			return {
				success: false,
				message: listMembersServiceRes.message ?? "Erro ao obter membros da constelação."
			}
		}

		const rawMembers: OrganizationMemberWithUser[] = listMembersServiceRes.data.members ?? []

		// 4) Listar todos os usuários já atribuídos a essa task
		const listAssignmentsServiceRes = await listOrganizationTaskAssignmentsWithUserByTaskIdService({
			taskId
		})

		if (listAssignmentsServiceRes.success === false || !listAssignmentsServiceRes.data) {
			return {
				success: false,
				message: listAssignmentsServiceRes.message ?? "Erro ao obter usuários já atribuídos à tarefa."
			}
		}

		const rawAssignments: OrganizationTaskAssignmentWithUser[] = listAssignmentsServiceRes.data.assignments ?? []

		// 5) Retornar só tipos de domínio, sem DTO de UI
		return {
			success: true,
			message: "Dados de atribuição de tarefa carregados com sucesso.",
			data: {
				members: rawMembers,
				assignments: rawAssignments
			}
		}
	} catch (err) {
		console.error("[getAssignableUsersForOrganizationTaskUseCase]: Unexpected error", err)

		return {
			success: false,
			message: "Erro inesperado ao carregar dados de atribuição da tarefa."
		}
	}
}

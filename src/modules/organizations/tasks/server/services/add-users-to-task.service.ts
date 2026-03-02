import { insertManyTaskAssignmentsAdminRepo } from "@/modules/organizations/tasks/server/repos/insert-many-task-assignments.admin.repo"
import type { OrganizationTaskAssignmentInsert } from "@/modules/organizations/tasks/shared/types/db"
import type { AddUsersToTaskParams } from "@/modules/organizations/tasks/shared/types/inputs"
import type { OperationResponse } from "@/shared/types/operation-response.types"

const GENERIC_ERROR = "Não foi possível atribuir usuários à tarefa. Tente novamente mais tarde."
const NO_USERS_ERROR = "Nenhum usuário selecionado para atribuição."
const prefixLog = "[addUsersToTaskService]:"

const DEFAULT_ASSIGNMENT_ROLE: OrganizationTaskAssignmentInsert["role"] = "MEMBER"

export async function addUsersToTaskService(params: AddUsersToTaskParams): OperationResponse<{ insertedCount: number }> {
	const { organizationId, taskId, userIds } = params

	if (!userIds || userIds.length === 0) {
		return {
			success: false,
			message: NO_USERS_ERROR
		}
	}

	const uniqueUserIds = Array.from(new Set(userIds))

	const assignments: OrganizationTaskAssignmentInsert[] = uniqueUserIds.map((userId) => ({
		organization_id: organizationId,
		task_id: taskId,
		user_id: userId,
		role: DEFAULT_ASSIGNMENT_ROLE
	}))

	try {
		const { data, error } = await insertManyTaskAssignmentsAdminRepo({ assignments })

		if (error) {
			console.error(`${prefixLog} ${error.message}`)
			return {
				success: false,
				message: GENERIC_ERROR
			}
		}

		const insertedCount = data?.length ?? 0

		return {
			success: true,
			message: insertedCount === 1 ? "1 usuário foi atribuído à tarefa com sucesso." : `${insertedCount} usuários foram atribuídos à tarefa com sucesso.`,
			data: {
				insertedCount
			}
		}
	} catch (error) {
		console.error(`${prefixLog} unexpected error:`, error)
		return {
			success: false,
			message: GENERIC_ERROR
		}
	}
}

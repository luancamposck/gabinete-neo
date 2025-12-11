// src/services/organization-task-assignments/add-many-users-to-organization-task.service.ts

import { insertManyOrganizationTaskAssignmentsRepo } from "@/repositories/organization-task-assignments/organization-task-assignments.repo"
import type { OrganizationTaskAssignmentInsert } from "@/types/domain/tasks/organization-task-assignments.types"
import type { OperationResponse } from "@/types/operation-response"

export interface AddManyUsersToOrganizationTaskServiceParams {
	organizationId: string
	taskId: string
	userIds: string[]
}

const DEFAULT_ASSIGNMENT_ROLE: OrganizationTaskAssignmentInsert["role"] = "MEMBER"

export async function addManyUsersToOrganizationTaskService(params: AddManyUsersToOrganizationTaskServiceParams): Promise<OperationResponse<{ insertedCount: number }>> {
	const { organizationId, taskId, userIds } = params

	if (!userIds || userIds.length === 0) {
		return {
			success: false,
			message: "Nenhum usuário selecionado para atribuição."
		}
	}

	// Remove duplicados de entrada
	const uniqueUserIds = Array.from(new Set(userIds))

	const assignments: OrganizationTaskAssignmentInsert[] = uniqueUserIds.map((userId) => ({
		organization_id: organizationId,
		task_id: taskId,
		user_id: userId,
		role: DEFAULT_ASSIGNMENT_ROLE // <-- fixo como "MEMBER"
		// created_at / updated_at ficam por conta do banco, se tiver default/trigger
	}))

	try {
		const { data, error } = await insertManyOrganizationTaskAssignmentsRepo({
			assignments
		})

		if (error) {
			console.error("[addManyUsersToOrganizationTaskService]:", error.message)

			return {
				success: false,
				message: "Erro ao atribuir usuários à tarefa."
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
	} catch (err) {
		console.error("[addManyUsersToOrganizationTaskService]: Unexpected error", err)

		return {
			success: false,
			message: "Erro inesperado ao atribuir usuários à tarefa."
		}
	}
}

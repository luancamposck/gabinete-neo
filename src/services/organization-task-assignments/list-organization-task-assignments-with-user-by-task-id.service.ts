// src/services/organization-task-assignments/list-organization-task-assignments-with-user-by-task-id.service.ts

import { listOrganizationTaskAssignmentsWithUserByTaskIdRepo } from "@/repositories/organization-task-assignments/organization-task-assignments.repo"
import type { OrganizationTaskAssignmentWithUser } from "@/types/domain/tasks/organization-task-assignments-with-user.types"
import type { OperationResponse } from "@/types/operation-response"

export async function listOrganizationTaskAssignmentsWithUserByTaskIdService({ taskId }: { taskId: string }): Promise<OperationResponse<{ assignments: OrganizationTaskAssignmentWithUser[] }>> {
	try {
		const { data, error } = await listOrganizationTaskAssignmentsWithUserByTaskIdRepo({ taskId })

		if (error) {
			console.error("[listOrganizationTaskAssignmentsWithUserByTaskIdService]:", error.message)

			return {
				success: false,
				message: "Erro ao obter usuários atribuídos à tarefa."
			}
		}

		return {
			success: true,
			message: "Usuários atribuídos à tarefa obtidos com sucesso.",
			data: {
				assignments: data ?? []
			}
		}
	} catch (err) {
		console.error("[listOrganizationTaskAssignmentsWithUserByTaskIdService]: Unexpected error", err)

		return {
			success: false,
			message: "Erro inesperado ao obter usuários atribuídos à tarefa."
		}
	}
}

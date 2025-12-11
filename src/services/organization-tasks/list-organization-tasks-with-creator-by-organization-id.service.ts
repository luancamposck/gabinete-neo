// src/services/organization-tasks/list-organization-tasks-by-organization-id.service.ts

import { listOrganizationTasksWithCreatorByOrganizationIdRepo } from "@/repositories/organization-tasks/organization-tasks.repo"
import type { OrganizationTaskWithCreator } from "@/types/domain/tasks/organization-tasks-with-relations.types"
import type { OperationResponse } from "@/types/operation-response"

export async function listOrganizationTasksWithCreatorByOrganizationIdService({ organizationId }: { organizationId: string }): Promise<OperationResponse<{ tasks: OrganizationTaskWithCreator[] }>> {
	try {
		const { data: orgTasksWithCreatorData, error: orgTasksWithCreatorError } = await listOrganizationTasksWithCreatorByOrganizationIdRepo({ organizationId })

		if (orgTasksWithCreatorError) {
			console.error("[listOrganizationTasksByOrganizationIdService]:", orgTasksWithCreatorError.message)

			return {
				success: false,
				message: "Erro ao buscar tarefas da constelação."
			}
		}

		return {
			success: true,
			message: "Tarefas carregadas com sucesso.",
			data: {
				tasks: orgTasksWithCreatorData
			}
		}
	} catch (err) {
		console.error("[listOrganizationTasksByOrganizationIdService]: Unexpected error", err)

		return {
			success: false,
			message: "Erro inesperado ao buscar tarefas da constelação."
		}
	}
}

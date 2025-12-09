// src/services/organization-tasks/create-organization-task.service.ts

import { insertOrganizationTaskRepo } from "@/repositories/organization-tasks/organization-tasks.repo"
import type { OrganizationTaskInsert } from "@/types/domain/tasks/organization-tasks.types"
import type { OperationResponse } from "@/types/operation-response"

export interface CreateOrganizationTaskServiceParams {
	organizationId: string
	title: string
	description?: string | null
	createdByUserId: string
	dueAt?: string | null // ISO string (timestamptz) ou null
}

export async function createOrganizationTaskService(params: CreateOrganizationTaskServiceParams): Promise<OperationResponse<{ taskId: string }>> {
	const { organizationId, title, description, createdByUserId, dueAt } = params

	try {
		const taskInsert: OrganizationTaskInsert = {
			organization_id: organizationId,
			title,
			description: description ?? null,

			// auditoria
			created_by_user_id: createdByUserId,
			updated_by_user_id: createdByUserId,

			// prazo (opcional)
			due_at: dueAt ?? null

			// status:
			// - Banco aplica o default 'NOT_STARTED' sempre
		}

		const { data, error } = await insertOrganizationTaskRepo({ task: taskInsert })

		if (error) {
			console.error("[createOrganizationTaskService]:", error.message)

			return {
				success: false,
				message: "Erro ao criar tarefa."
			}
		}

		if (!data) {
			console.error("[createOrganizationTaskService]: insert retornou sem data nem error")

			return {
				success: false,
				message: "Erro inesperado ao criar tarefa."
			}
		}

		return {
			success: true,
			message: "Tarefa criada com sucesso.",
			data: {
				taskId: data.id
			}
		}
	} catch (err) {
		console.error("[createOrganizationTaskService]: Unexpected error", err)

		return {
			success: false,
			message: "Erro inesperado ao criar tarefa."
		}
	}
}

// src/actions/organization-tasks/create-organization-task.action.ts

"use server"

import { createOrganizationTaskBaseSchemaServer } from "@/lib/validations/organization-tasks-schemas/create-organization-task-schema.server"
import type { OperationResponse } from "@/types/operation-response"
import { createOrganizationTaskForCurrentUserUseCase } from "@/use-cases/create-organization-task-for-current-user.use-case"

export async function createOrganizationTaskAction(formData: unknown): Promise<OperationResponse<{ taskId: string }>> {
	// 1) Validação dos dados do formulário
	const parsed = createOrganizationTaskBaseSchemaServer.safeParse(formData)

	if (!parsed.success) {
		console.error("[createOrganizationTaskAction] Zod error:", parsed.error)

		return {
			success: false,
			message: "Dados inválidos ao criar a tarefa. Verifique o título e a descrição."
		}
	}

	const { title, description, dueDate } = parsed.data

	// 2) Delegar toda a orquestração para o use-case
	return createOrganizationTaskForCurrentUserUseCase({
		title,
		description,
		dueAt: dueDate ? dueDate.toISOString() : null
	})
}

// src/app/dashboard/task/all/sub-actions/assign-users-to-organization-task.action.ts

"use server"

import type { OperationResponse } from "@/types/operation-response"
import { assignUsersToOrganizationTaskUseCase } from "@/use-cases/assign-users-to-organization-task.use-case"

interface AssignUsersToOrganizationTaskActionParams {
	taskId: string
	userIds: string[]
}

export async function assignUsersToOrganizationTaskAction(params: AssignUsersToOrganizationTaskActionParams): Promise<OperationResponse<{ insertedCount: number }>> {
	const { taskId, userIds } = params

	// Validação bem básica aqui (sem Zod por enquanto)
	if (!taskId || !Array.isArray(userIds)) {
		return {
			success: false,
			message: "Dados inválidos para atribuir usuários à tarefa."
		}
	}

	if (userIds.length === 0) {
		return {
			success: false,
			message: "Selecione pelo menos um usuário para atribuir à tarefa."
		}
	}

	try {
		const useCaseRes = await assignUsersToOrganizationTaskUseCase({
			taskId,
			userIds
		})

		return useCaseRes
	} catch (err) {
		console.error("[assignUsersToOrganizationTaskAction]: Unexpected error", err)

		return {
			success: false,
			message: "Erro inesperado ao atribuir usuários à tarefa."
		}
	}
}

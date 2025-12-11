// src/app/dashboard/task/all/sub-actions/get-tasks-for-table.action.ts

"use server"

import { listOrganizationTasksWithCreatorByOrganizationIdService } from "@/services/organization-tasks/list-organization-tasks-with-creator-by-organization-id.service"
import type { OrganizationTaskDTO } from "@/types/dto/organization-task.dto"
import type { OperationResponse } from "@/types/operation-response"

export async function getTasksForTableAction({ organizationId }: { organizationId: string }): Promise<OperationResponse<{ tasks: OrganizationTaskDTO[] }>> {
	const serviceRes = await listOrganizationTasksWithCreatorByOrganizationIdService({ organizationId })

	if (!serviceRes.success || !serviceRes.data) {
		return {
			success: false,
			message: serviceRes.message ?? "Erro ao obter tarefas da constelação."
		}
	}

	const rawTasks = serviceRes.data.tasks

	const tasks: OrganizationTaskDTO[] = rawTasks.map((task) => ({
		id: task.id,
		title: task.title,
		description: task.description ?? null,
		status: task.status,
		dueAt: task.due_at,
		createdAt: task.created_at,
		createdByName: task.created_by?.name ?? null,
		createdByEmail: task.created_by?.email ?? null
	}))

	return {
		success: true,
		message: serviceRes.message,
		data: {
			tasks
		}
	}
}

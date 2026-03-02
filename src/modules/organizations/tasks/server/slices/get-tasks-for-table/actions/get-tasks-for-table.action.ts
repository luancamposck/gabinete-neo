"use server"

import { getTasksForTableUseCase } from "@/modules/organizations/tasks/server/slices/get-tasks-for-table/use-cases/get-tasks-for-table.use-case"
import type { OrganizationTaskTableRow } from "@/modules/organizations/tasks/shared/types/organization-tasks-table.types"
import type { OperationResponse } from "@/shared/types/operation-reponse.types"

type ErrorCodes = "unauthenticated" | "org_not_found" | "not_member" | "infra_error"

type GetTasksForTableActionRes = {
	tasks: OrganizationTaskTableRow[]
}

export async function getTasksForTableAction(): OperationResponse<GetTasksForTableActionRes, ErrorCodes> {
	const useCaseRes = await getTasksForTableUseCase()

	if (useCaseRes.success === false) {
		return {
			success: false,
			message: useCaseRes.message,
			code: useCaseRes.code
		}
	}

	const tasks: OrganizationTaskTableRow[] = useCaseRes.data.tasks.map((task) => ({
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
		message: useCaseRes.message,
		data: {
			tasks
		}
	}
}

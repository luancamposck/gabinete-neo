"use server"

import { revalidatePath } from "next/cache"
import { assignUsersToTaskUseCase } from "@/modules/organizations/tasks/server/slices/assign-users-to-task/use-cases/assign-users-to-task.use-case"
import type { OperationResponse } from "@/shared/types/operation-reponse.types"

type AssignUsersToTaskActionParams = {
	taskId: string
	userIds: string[]
}

type ErrorCodes = "unauthenticated" | "org_not_found" | "not_member" | "validation_error" | "infra_error"

export async function assignUsersToTaskAction(params: AssignUsersToTaskActionParams): OperationResponse<{ insertedCount: number }, ErrorCodes> {
	const useCaseRes = await assignUsersToTaskUseCase(params)

	if (useCaseRes.success === false) {
		return useCaseRes
	}

	revalidatePath("/dashboard/task")

	return useCaseRes
}

"use server"

import { revalidatePath } from "next/cache"
import { createTaskUseCase } from "@/modules/organizations/tasks/server/slices/create-task/use-cases/create-task.use-case"
import type { OperationResponse } from "@/shared/types/operation-response.types"

type CreateTaskActionParams = {
	title: string
	description?: string | null
	dueDate?: Date | null
}

type ErrorCodes = "unauthenticated" | "org_not_found" | "not_member" | "validation_error" | "infra_error"

export async function createTaskAction(params: CreateTaskActionParams): OperationResponse<{ taskId: string }, ErrorCodes> {
	const useCaseRes = await createTaskUseCase(params)

	if (useCaseRes.success === false) {
		return useCaseRes
	}

	revalidatePath("/dashboard/task")

	return useCaseRes
}

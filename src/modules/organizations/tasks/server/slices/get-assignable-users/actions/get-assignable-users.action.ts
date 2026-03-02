"use server"

import { getAssignableUsersUseCase } from "@/modules/organizations/tasks/server/slices/get-assignable-users/use-cases/get-assignable-users.use-case"
import type { AssignableUserForTask } from "@/modules/organizations/tasks/shared/types/organization-tasks-table.types"
import type { OperationResponse } from "@/shared/types/operation-reponse.types"

type ErrorCodes = "unauthenticated" | "org_not_found" | "not_member" | "validation_error" | "infra_error"

type GetAssignableUsersActionRes = {
	members: AssignableUserForTask[]
	assignedUserIds: string[]
}

export async function getAssignableUsersAction(params: { taskId: string }): OperationResponse<GetAssignableUsersActionRes, ErrorCodes> {
	const useCaseRes = await getAssignableUsersUseCase(params)

	if (useCaseRes.success === false) {
		return {
			success: false,
			message: useCaseRes.message,
			code: useCaseRes.code
		}
	}

	const { members: rawMembers, assignments: rawAssignments } = useCaseRes.data

	const members: AssignableUserForTask[] = rawMembers.map((member) => ({
		userId: member.user_id,
		name: member.user.name,
		email: member.user.email,
		role: member.role.name,
		isActive: member.is_active
	}))

	const assignedUserIds: string[] = rawAssignments.map((assignment) => assignment.user_id)

	return {
		success: true,
		message: useCaseRes.message,
		data: {
			members,
			assignedUserIds
		}
	}
}

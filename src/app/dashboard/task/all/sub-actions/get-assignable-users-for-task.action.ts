// src/app/dashboard/task/all/sub-actions/get-assignable-users-for-task.action.ts
"use server"

import type { OrganizationMemberWithUser } from "@/types/domain/organization/organization-member.types"
import type { OperationResponse } from "@/types/operation-response"
import { getAssignableUsersForOrganizationTaskUseCase } from "@/use-cases/get-assignable-users-for-organization-task.use-case"

export interface AssignableUserForTaskDTO {
	userId: string
	name: string
	email: string
	role: OrganizationMemberWithUser["role"]
	isActive: boolean
}

export async function getAssignableUsersForTaskAction({ taskId }: { taskId: string }): Promise<OperationResponse<{ members: AssignableUserForTaskDTO[]; assignedUserIds: string[] }>> {
	if (!taskId) {
		return {
			success: false,
			message: "Tarefa inválida para carregar usuários atribuíveis."
		}
	}

	try {
		const useCaseRes = await getAssignableUsersForOrganizationTaskUseCase({ taskId })

		if (useCaseRes.success === false || !useCaseRes.data) {
			return {
				success: false,
				message: useCaseRes.message ?? "Erro ao carregar dados de atribuição da tarefa."
			}
		}

		const { members: rawMembers, assignments: rawAssignments } = useCaseRes.data

		// 1) Montar DTO de membros para a UI (select)
		const members: AssignableUserForTaskDTO[] = rawMembers.map((member) => {
			const user = member.user

			return {
				userId: member.user_id,
				name: user.name,
				email: user.email,
				role: member.role,
				isActive: member.is_active
			}
		})

		// 2) Extrair lista de userIds já atribuídos à task
		const assignedUserIds: string[] = rawAssignments.map((assignment) => assignment.user_id)

		return {
			success: true,
			message: useCaseRes.message,
			data: {
				members,
				assignedUserIds
			}
		}
	} catch (err) {
		console.error("[getAssignableUsersForTaskAction]: Unexpected error", err)

		return {
			success: false,
			message: "Erro inesperado ao carregar usuários atribuíveis da tarefa."
		}
	}
}

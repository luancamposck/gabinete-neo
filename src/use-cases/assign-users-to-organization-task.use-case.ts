// src/use-cases/assign-users-to-organization-task.use-case.ts

import { getCurrentAuthUserService } from "@/services/auth/get-current-auth-user.service"
import { getOrganizationMembershipByUserIdService } from "@/services/organization-membership/get-organization-membership-by-user-id.service"
import { type AddManyUsersToOrganizationTaskServiceParams, addManyUsersToOrganizationTaskService } from "@/services/organization-task-assignments/add-many-users-to-organization-task.service"
import type { OperationResponse } from "@/types/operation-response"

interface AssignUsersToOrganizationTaskUseCaseParams {
	userIds: string[]
	taskId: string
}

export async function assignUsersToOrganizationTaskUseCase(params: AssignUsersToOrganizationTaskUseCaseParams): Promise<OperationResponse<{ insertedCount: number }>> {
	const { userIds, taskId } = params

	if (!userIds || userIds.length === 0) {
		return {
			success: false,
			message: "Selecione pelo menos um usuário para atribuir à tarefa."
		}
	}

	try {
		// 1) Pegar current user
		const getCurrentAuthUserServiceRes = await getCurrentAuthUserService()
		if (!getCurrentAuthUserServiceRes.success) {
			return {
				success: false,
				message: getCurrentAuthUserServiceRes.message
			}
		}

		const userId = getCurrentAuthUserServiceRes.data.user.id

		// 2) Pegar organizationId pela membership
		const getOrganizationMembershipByUserIdServiceRes = await getOrganizationMembershipByUserIdService({ userId })
		if (!getOrganizationMembershipByUserIdServiceRes.success) {
			return {
				success: false,
				message: getOrganizationMembershipByUserIdServiceRes.message
			}
		}

		const organizationId = getOrganizationMembershipByUserIdServiceRes.data.organizationMemberships.organization_id

		// 3) Chama a service para atribuir usuários à tarefa da organização
		const addManyUsersToOrganizationTaskServiceParams: AddManyUsersToOrganizationTaskServiceParams = {
			userIds,
			taskId,
			organizationId
		}

		const addManyUsersToOrganizationTaskServiceRes = await addManyUsersToOrganizationTaskService(addManyUsersToOrganizationTaskServiceParams)

		if (addManyUsersToOrganizationTaskServiceRes.success === false) {
			return {
				success: false,
				message: addManyUsersToOrganizationTaskServiceRes.message
			}
		}

		const insertedCount = addManyUsersToOrganizationTaskServiceRes.data.insertedCount

		// 4) Caso tudo ok, retorna sucesso
		return {
			success: true,
			message: addManyUsersToOrganizationTaskServiceRes.message,
			data: {
				insertedCount
			}
		}
	} catch (err) {
		console.error("[assignUsersToOrganizationTaskUseCase]: Unexpected error", err)

		return {
			success: false,
			message: "Erro inesperado ao atribuir usuários à tarefa."
		}
	}
}

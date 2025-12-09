// src/use-cases/create-organization-task-for-current-user.service.ts

import { getCurrentAuthUserService } from "@/services/auth/get-current-auth-user.service"
import { getOrganizationMembershipByUserIdService } from "@/services/organization-membership/get-organization-membership-by-user-id.service"
import { createOrganizationTaskService } from "@/services/organization-tasks/create-organization-task.service"
import type { OperationResponse } from "@/types/operation-response"

export interface CreateOrganizationTaskForCurrentUserUseCaseParams {
	title: string
	description?: string | null
	dueAt?: string | null // opcional por enquanto
}

export async function createOrganizationTaskForCurrentUserUseCase(params: CreateOrganizationTaskForCurrentUserUseCaseParams): Promise<OperationResponse<{ taskId: string }>> {
	const { title, description, dueAt } = params

	try {
		// 1) Obter usuário autenticado (via getUser, não getSession)
		const currentUserRes = await getCurrentAuthUserService()

		if (currentUserRes.success === false || !currentUserRes.data?.user) {
			console.error("[createOrganizationTaskForCurrentUserUseCase] getCurrentAuthUserService error:", currentUserRes.success === false ? currentUserRes.message : "Usuário não encontrado")

			return {
				success: false,
				message: "Você precisa estar autenticado para criar uma tarefa."
			}
		}

		const userId = currentUserRes.data.user.id

		// 2) Descobrir a organização do usuário (regra: 1 user -> 1 org)
		const membershipRes = await getOrganizationMembershipByUserIdService({ userId })

		if (membershipRes.success === false) {
			console.error("[createOrganizationTaskForCurrentUserUseCase] membership service error:", membershipRes.message)

			return {
				success: false,
				message: "Não foi possível verificar sua participação na constelação."
			}
		}

		const organizationMembership = membershipRes.data.organizationMemberships

		if (organizationMembership.is_active === false) {
			console.error("[createOrganizationTaskForCurrentUserUseCase] Usuário sem constelação ativa")

			return {
				success: false,
				message: "Você precisa estar vinculado a uma constelação ativa para criar tarefas."
			}
		}

		const organizationId = organizationMembership.organization_id

		// 3) Criar a task em si
		const createTaskRes = await createOrganizationTaskService({
			organizationId,
			title,
			description: description ?? null,
			createdByUserId: userId,
			dueAt: dueAt ?? null
		})

		if (createTaskRes.success === false) {
			console.error("[createOrganizationTaskForCurrentUserUseCase] createOrganizationTaskService error:", createTaskRes.message)

			// Repassa mensagem amigável da service
			return {
				success: false,
				message: createTaskRes.message || "Não foi possível criar a tarefa."
			}
		}

		return {
			success: true,
			message: "Tarefa criada com sucesso.",
			data: {
				taskId: createTaskRes.data.taskId
			}
		}
	} catch (err) {
		console.error("[createOrganizationTaskForCurrentUserUseCase] Unexpected error", err)

		return {
			success: false,
			message: "Erro inesperado ao criar a tarefa."
		}
	}
}

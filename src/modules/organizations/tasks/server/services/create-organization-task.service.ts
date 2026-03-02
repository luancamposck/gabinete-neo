import { insertOrganizationTaskAdminRepo } from "@/modules/organizations/tasks/server/repos/insert-organization-task.admin.repo"
import type { OrganizationTaskInsert } from "@/modules/organizations/tasks/shared/types/db"
import type { CreateOrganizationTaskParams } from "@/modules/organizations/tasks/shared/types/inputs"
import type { OperationResponse } from "@/shared/types/operation-response.types"

const GENERIC_ERROR = "Não foi possível criar a tarefa. Tente novamente mais tarde."
const OK_MESSAGE = "Tarefa criada com sucesso."
const prefixLog = "[createOrganizationTaskService]:"

export async function createOrganizationTaskService(params: CreateOrganizationTaskParams): OperationResponse<{ taskId: string }> {
	try {
		const insertParams: OrganizationTaskInsert = {
			organization_id: params.organizationId,
			title: params.title,
			description: params.description ?? null,
			created_by_user_id: params.createdByUserId,
			updated_by_user_id: params.createdByUserId,
			due_at: params.dueAt ?? null
		}

		const { data, error } = await insertOrganizationTaskAdminRepo(insertParams)

		if (error) {
			console.error(`${prefixLog} ${error.message}`)
			return {
				success: false,
				message: GENERIC_ERROR
			}
		}

		return {
			success: true,
			message: OK_MESSAGE,
			data: {
				taskId: data.id
			}
		}
	} catch (error) {
		console.error(`${prefixLog} unexpected error:`, error)
		return {
			success: false,
			message: GENERIC_ERROR
		}
	}
}

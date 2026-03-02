import { listOrganizationTasksWithCreatorAdminRepo, type OrganizationTaskWithCreator } from "@/modules/organizations/tasks/server/repos/list-organization-tasks-with-creator.admin.repo"
import type { OperationResponse } from "@/shared/types/operation-response.types"

const GENERIC_ERROR = "Não foi possível obter as tarefas da constelação. Tente novamente mais tarde."
const OK_MESSAGE = "Tarefas carregadas com sucesso."
const prefixLog = "[listOrganizationTasksWithCreatorService]:"

export async function listOrganizationTasksWithCreatorService(params: { organizationId: string }): OperationResponse<{ tasks: OrganizationTaskWithCreator[] }> {
	try {
		const { data, error } = await listOrganizationTasksWithCreatorAdminRepo(params)

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
				tasks: data ?? []
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

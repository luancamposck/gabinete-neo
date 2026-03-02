import {
	listTaskAssignmentsWithUserAdminRepo,
	type TaskAssignmentWithUser
} from "@/modules/organizations/tasks/server/repos/list-task-assignments-with-user.admin.repo"
import type { OperationResponse } from "@/shared/types/operation-reponse.types"

const GENERIC_ERROR = "Não foi possível obter os usuários atribuídos à tarefa. Tente novamente mais tarde."
const OK_MESSAGE = "Usuários atribuídos à tarefa obtidos com sucesso."
const prefixLog = "[listTaskAssignmentsWithUserService]:"

export async function listTaskAssignmentsWithUserService(params: { taskId: string }): OperationResponse<{ assignments: TaskAssignmentWithUser[] }> {
	try {
		const { data, error } = await listTaskAssignmentsWithUserAdminRepo(params)

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
				assignments: data ?? []
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

import { deleteRoleByIdAndOrganizationIdAdminRepo } from "@/modules/organizations/memberships/server/repos/delete-role-by-id-and-organization-id.admin.repo"
import type { OperationResponse } from "@/shared/types/operation-reponse.types"

type DeleteRoleByIdAndOrganizationIdServiceParams = {
	roleId: string
	organizationId: string
}

const prefixLog = "[deleteRoleByIdAndOrganizationIdService]:"
const MSG_INFRA_ERROR = "Não foi possível remover o cargo."

export async function deleteRoleByIdAndOrganizationIdService(params: DeleteRoleByIdAndOrganizationIdServiceParams): OperationResponse<{ deleted: boolean }, "infra_error"> {
	try {
		const { data, error } = await deleteRoleByIdAndOrganizationIdAdminRepo(params)

		if (error) {
			console.error(`${prefixLog} ${error.message}`)
			return {
				success: false,
				message: MSG_INFRA_ERROR,
				code: "infra_error"
			}
		}

		return {
			success: true,
			message: "Operação de remoção de cargo executada.",
			data: {
				deleted: Boolean(data?.id)
			}
		}
	} catch (error) {
		console.error(`${prefixLog} unexpected error:`, error)
		return {
			success: false,
			message: MSG_INFRA_ERROR,
			code: "infra_error"
		}
	}
}

import { insertRoleAdminRepo } from "@/modules/organizations/memberships/server/repos/insert-role.admin.repo"
import type { OperationResponse } from "@/shared/types/operation-response.types"

type CreateRoleServiceParams = {
	organizationId: string
	name: string
	isSystem: boolean
	isActive: boolean
}

type ErrorCodes = "role_name_conflict" | "infra_error"

const prefixLog = "[createRoleService]:"
const MSG_INFRA_ERROR = "Não foi possível criar o cargo. Tente novamente em instantes."
const MSG_ROLE_NAME_CONFLICT = "Já existe um cargo com este nome na organização."

export async function createRoleService(params: CreateRoleServiceParams): OperationResponse<{ role: { id: string; organizationId: string; name: string; isSystem: boolean; isActive: boolean } }, ErrorCodes> {
	try {
		const { data, error } = await insertRoleAdminRepo(params)

		if (error) {
			if (error.code === "23505") {
				return {
					success: false,
					message: MSG_ROLE_NAME_CONFLICT,
					code: "role_name_conflict"
				}
			}

			console.error(`${prefixLog} ${error.message}`)
			return {
				success: false,
				message: MSG_INFRA_ERROR,
				code: "infra_error"
			}
		}

		if (!data?.id || !data?.organization_id) {
			console.error(`${prefixLog} missing role data after insert`)
			return {
				success: false,
				message: MSG_INFRA_ERROR,
				code: "infra_error"
			}
		}

		return {
			success: true,
			message: "Cargo criado com sucesso.",
			data: {
				role: {
					id: data.id,
					organizationId: data.organization_id,
					name: data.name,
					isSystem: data.is_system,
					isActive: data.is_active
				}
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

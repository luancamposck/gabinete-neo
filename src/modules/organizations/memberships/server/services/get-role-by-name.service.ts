// @/modules/organizations/memberships/server/services/get-role-by-name.service.ts

import { getRoleAdminRepo } from "@/modules/organizations/memberships/server/repos/get-role.admin.repo"
import type { RoleView } from "@/modules/organizations/memberships/shared/types/views"
import type { OperationResponse } from "@/shared/types/operation-response.types"

type Params = {
	organizationId: string
	name: string
}

type ErrorCodes = "role_not_found" | "role_inactive" | "infra_error"

const prefixLog = "[getRoleByNameService]:"
const GENERIC_ERROR = "Não foi possível obter o cargo. Tente novamente mais tarde."
const NOT_FOUND_ERROR = "Cargo não encontrado para esta constelação."
const INACTIVE_ERROR = "Este cargo está inativo e não pode ser usado."
const SUCCESS_MESSAGE = "Cargo validado com sucesso."

export async function getRoleByNameService(params: Params): OperationResponse<{ role: RoleView }, ErrorCodes> {
	try {
		const { data, error } = await getRoleAdminRepo(params)

		if (error) {
			console.error(`${prefixLog} ${error.message}`)
			return {
				success: false,
				message: GENERIC_ERROR,
				code: "infra_error"
			}
		}

		if (!data) {
			return {
				success: false,
				message: NOT_FOUND_ERROR,
				code: "role_not_found"
			}
		}

		if (data.is_active === false) {
			return {
				success: false,
				message: INACTIVE_ERROR,
				code: "role_inactive"
			}
		}

		return {
			success: true,
			message: SUCCESS_MESSAGE,
			data: {
				role: data
			}
		}
	} catch (error) {
		console.error(`${prefixLog} unexpected error:`, error)
		return {
			success: false,
			message: GENERIC_ERROR,
			code: "infra_error"
		}
	}
}

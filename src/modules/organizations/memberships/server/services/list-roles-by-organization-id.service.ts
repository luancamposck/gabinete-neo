// @/modules/organizations/memberships/server/services/list-roles-by-organization-id.service.ts

import { listRolesByOrganizationIdAdminRepo } from "@/modules/organizations/memberships/server/repos/list-roles-by-organization-id.admin.repo"
import type { RoleView } from "@/modules/organizations/memberships/shared/types/views"
import type { OperationResponse } from "@/shared/types/operation-response.types"

const GENERIC_ERROR = "Não foi possível obter os cargos da organização. Tente novamente mais tarde."
const OK_MESSAGE = "Cargos obtidos com sucesso."
const prefixLog = "[listRolesByOrganizationIdService]:"

export async function listRolesByOrganizationIdService(params: { organizationId: string }): OperationResponse<{ roles: RoleView[] }> {
	try {
		const { data, error } = await listRolesByOrganizationIdAdminRepo(params)

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
				roles: data ?? []
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

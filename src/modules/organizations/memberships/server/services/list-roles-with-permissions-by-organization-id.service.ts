import { listRolesWithPermissionsByOrganizationIdAdminRepo } from "@/modules/organizations/memberships/server/repos/list-roles-with-permissions-by-organization-id.admin.repo"
import { rethrowIfNextError } from "@/shared/infra/next/rethrow-if-next-error"
import type { OperationResponse } from "@/shared/types/operation-reponse.types"

type RolePermission = {
	id: string
	key: string
	description: string
}

type RoleWithPermissions = {
	id: string
	name: string
	is_active: boolean
	is_system: boolean
	permissions: RolePermission[]
}

const prefixLog = "[listRolesWithPermissionsByOrganizationIdService]:"
const MSG_ERROR = "Não foi possível carregar os cargos da organização."
const MSG_SUCCESS = "Cargos da organização carregados com sucesso."

export async function listRolesWithPermissionsByOrganizationIdService({ organizationId }: { organizationId: string }): OperationResponse<{ roles: RoleWithPermissions[] }, "infra_error"> {
	try {
		const { data, error } = await listRolesWithPermissionsByOrganizationIdAdminRepo({ organizationId })

		if (error) {
			console.error(`${prefixLog} ${error.message}`)
			return {
				success: false,
				message: MSG_ERROR,
				code: "infra_error"
			}
		}

		const roles: RoleWithPermissions[] = (data ?? []).map((role) => ({
			id: role.id,
			name: role.name,
			is_active: role.is_active,
			is_system: role.is_system,
			permissions: (role.role_permissions ?? []).map((item) => item.permission).filter((permission): permission is RolePermission => Boolean(permission))
		}))

		return {
			success: true,
			message: MSG_SUCCESS,
			data: { roles }
		}
	} catch (error) {
		rethrowIfNextError(error)
		console.error(`${prefixLog} unexpected error:`, error)

		return {
			success: false,
			message: MSG_ERROR,
			code: "infra_error"
		}
	}
}

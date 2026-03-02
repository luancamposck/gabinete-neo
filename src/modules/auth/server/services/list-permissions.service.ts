import { listPermissionsAdminRepo } from "@/modules/auth/server/repos/list-permissions.admin.repo"
import { rethrowIfNextError } from "@/shared/infra/next/rethrow-if-next-error"
import type { OperationResponse } from "@/shared/types/operation-response.types"

const prefixLog = "[listPermissionsService]:"
const GENERIC_ERROR = "Não foi possível listar permissões. Tente novamente mais tarde."
const SUCCESS_MSG = "Permissões listadas com sucesso."

type PermissionCatalogItem = {
	id: string
	key: string
	description: string
}

type ErrorCodes = "infra_error"

export async function listPermissionsService(): OperationResponse<{ permissions: PermissionCatalogItem[] }, ErrorCodes> {
	try {
		const { data, error } = await listPermissionsAdminRepo()

		if (error) {
			console.error(`${prefixLog} ${error.message}`)
			return {
				success: false,
				message: GENERIC_ERROR,
				code: "infra_error"
			}
		}

		const permissions = Array.isArray(data)
			? data
					.filter((permission): permission is PermissionCatalogItem => Boolean(permission?.id && permission?.key && permission?.description))
					.map((permission) => ({
						id: permission.id,
						key: permission.key,
						description: permission.description
					}))
			: []

		return {
			success: true,
			message: SUCCESS_MSG,
			data: {
				permissions
			}
		}
	} catch (error) {
		rethrowIfNextError(error)

		console.error(`${prefixLog} unexpected error:`, error)
		return { success: false, code: "infra_error", message: GENERIC_ERROR }
	}
}

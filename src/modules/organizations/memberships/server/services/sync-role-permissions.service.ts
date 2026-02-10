import { deleteRolePermissionsAdminRepo } from "@/modules/organizations/memberships/server/repos/delete-role-permissions.admin.repo"
import { insertRolePermissionsAdminRepo } from "@/modules/organizations/memberships/server/repos/insert-role-permissions.admin.repo"
import { listRolePermissionIdsByRoleIdAdminRepo } from "@/modules/organizations/memberships/server/repos/list-role-permission-ids-by-role-id.admin.repo"
import { rethrowIfNextError } from "@/shared/infra/next/rethrow-if-next-error"
import type { OperationResponse } from "@/shared/types/operation-reponse.types"

type Params = {
	roleId: string
	targetPermissionIds: string[]
}

type ErrorCodes = "infra_error"

const prefixLog = "[syncRolePermissionsService]:"
const GENERIC_ERROR = "Não foi possível sincronizar permissões do cargo. Tente novamente mais tarde."
const SUCCESS_MSG = "Permissões do cargo sincronizadas com sucesso."

export async function syncRolePermissionsService(params: Params): OperationResponse<{ addedCount: number; removedCount: number }, ErrorCodes> {
	try {
		const currentRes = await listRolePermissionIdsByRoleIdAdminRepo({ roleId: params.roleId })

		if (currentRes.error) {
			console.error(`${prefixLog} list current failed: ${currentRes.error.message}`)
			return {
				success: false,
				message: GENERIC_ERROR,
				code: "infra_error"
			}
		}

		const currentPermissionIds = new Set((currentRes.data ?? []).map((item) => item.permission_id))
		const targetPermissionIds = new Set(params.targetPermissionIds)

		const permissionIdsToAdd = [...targetPermissionIds].filter((permissionId) => !currentPermissionIds.has(permissionId))
		const permissionIdsToRemove = [...currentPermissionIds].filter((permissionId) => !targetPermissionIds.has(permissionId))

		// Inserimos antes de remover para reduzir risco de role ficar sem permissões em falha parcial.
		if (permissionIdsToAdd.length > 0) {
			const insertRes = await insertRolePermissionsAdminRepo({
				roleId: params.roleId,
				permissionIds: permissionIdsToAdd
			})

			if (insertRes.error) {
				console.error(`${prefixLog} insert failed: ${insertRes.error.message}`)
				return {
					success: false,
					message: GENERIC_ERROR,
					code: "infra_error"
				}
			}
		}

		if (permissionIdsToRemove.length > 0) {
			const deleteRes = await deleteRolePermissionsAdminRepo({
				roleId: params.roleId,
				permissionIds: permissionIdsToRemove
			})

			if (deleteRes.error) {
				console.error(`${prefixLog} delete failed: ${deleteRes.error.message}`)
				return {
					success: false,
					message: GENERIC_ERROR,
					code: "infra_error"
				}
			}
		}

		return {
			success: true,
			message: SUCCESS_MSG,
			data: {
				addedCount: permissionIdsToAdd.length,
				removedCount: permissionIdsToRemove.length
			}
		}
	} catch (error) {
		rethrowIfNextError(error)
		console.error(`${prefixLog} unexpected error:`, error)
		return {
			success: false,
			message: GENERIC_ERROR,
			code: "infra_error"
		}
	}
}

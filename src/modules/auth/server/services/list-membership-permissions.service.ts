// @/modules/auth/server/services/list-membership-permissions.service.ts
import { listMembershipPermissionsRepo } from "@/modules/auth/server/repos/list-membership-permissions.repo"
import { PERMISSIONS, type PermissionKey } from "@/modules/auth/shared/permissions"
import { rethrowIfNextError } from "@/shared/infra/next/rethrow-if-next-error"
import type { OperationResponse } from "@/shared/types/operation-response.types"

const prefixLog = "[listMembershipPermissionsService]:"
const GENERIC_ERROR = "Não foi possível listar permissões. Tente novamente mais tarde."
const SUCCESS_MSG = "Permissões listadas com sucesso."
const permissionKeysSet = new Set<PermissionKey>(Object.values(PERMISSIONS))

type ErrorCodes = "infra_error"

type Params = {
	organizationId: string
	userId: string
}

const isPermissionKey = (value: unknown): value is PermissionKey => typeof value === "string" && permissionKeysSet.has(value as PermissionKey)

export async function listMembershipPermissionsService(params: Params): OperationResponse<{ permissionKeys: PermissionKey[] }, ErrorCodes> {
	try {
		const { data, error } = await listMembershipPermissionsRepo(params)

		if (error) {
			console.error(`${prefixLog} ${error.message}`)
			return {
				success: false,
				message: GENERIC_ERROR,
				code: "infra_error"
			}
		}

		const permissionKeys = Array.isArray(data) ? data.filter(isPermissionKey) : []

		return {
			success: true,
			message: SUCCESS_MSG,
			data: {
				permissionKeys
			}
		}
	} catch (err) {
		rethrowIfNextError(err)

		console.error(`${prefixLog} unexpected error:`, err)
		return { success: false, code: "infra_error", message: GENERIC_ERROR }
	}
}

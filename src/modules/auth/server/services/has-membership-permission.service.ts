// @/modules/auth/server/services/has-membership-permission.service.ts
import { existsPermissionForMembershipRepo } from "@/modules/auth/server/repos/exists-permission-for-membership.repo"
import type { PermissionKey } from "@/modules/auth/shared/permissions"
import { rethrowIfNextError } from "@/shared/infra/next/rethrow-if-next-error"
import type { OperationResponse } from "@/shared/types/operation-response.types"

const prefixLog = "[hasMembershipPermissionService]:"
const GENERIC_ERROR = "Não foi possível verificar permissões. Tente novamente mais tarde."
const SUCCESS_MSG = "Permissão verificada com sucesso."

type ErrorCodes = "infra_error"

type Params = {
	organizationId: string
	userId: string
	permissionKey: PermissionKey
}

export async function hasMembershipPermissionService(params: Params): OperationResponse<{ allowed: boolean }, ErrorCodes> {
	try {
		const { data, error } = await existsPermissionForMembershipRepo(params)

		if (error) {
			console.error(`${prefixLog} ${error.message}`)
			return {
				success: false,
				message: GENERIC_ERROR,
				code: "infra_error"
			}
		}

		// RPC retorna boolean (pode vir null em edge cases)
		return {
			success: true,
			message: SUCCESS_MSG,
			data: {
				allowed: Boolean(data)
			}
		}
	} catch (err) {
		rethrowIfNextError(err)

		console.error(`${prefixLog} unexpected error:`, err)
		return { success: false, code: "infra_error", message: GENERIC_ERROR }
	}
}

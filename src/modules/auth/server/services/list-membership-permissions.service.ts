// @/modules/auth/server/services/list-membership-permissions.service.ts
import { listMembershipPermissionsRepo } from "@/modules/auth/server/repos/list-membership-permissions.repo"
import { rethrowIfNextError } from "@/shared/infra/next/rethrow-if-next-error"
import type { OperationResponse } from "@/shared/types/operation-reponse.types"

const prefixLog = "[listMembershipPermissionsService]:"
const GENERIC_ERROR = "Não foi possível listar permissões. Tente novamente mais tarde."
const SUCCESS_MSG = "Permissões listadas com sucesso."

type ErrorCodes = "infra_error"

type Params = {
	organizationId: string
	userId: string
}

export async function listMembershipPermissionsService(params: Params): OperationResponse<{ permissionKeys: string[] }, ErrorCodes> {
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

		const permissionKeys = Array.isArray(data) ? data.filter((key): key is string => typeof key === "string") : []

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

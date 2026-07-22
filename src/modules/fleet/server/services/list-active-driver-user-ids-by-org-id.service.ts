// @/modules/fleet/server/services/list-active-driver-user-ids-by-org-id.service.ts

import type { AppResultAsync } from "@/shared/types/app-result.types"
import { listActiveDriverUserIdsByOrgIdAdminRepo } from "../repos/list-active-driver-user-ids-by-org-id.admin.repo"

const prefixLog = "[listActiveDriverUserIdsByOrgIdService]:"

const FALLBACK_ERROR = {
	success: false,
	code: "generic_error"
} as const

/**
 * Lista os user_ids que já são motoristas ativos na organização.
 *
 * Usado pelo contexto de "adicionar candidatura" para sinalizar/desabilitar no
 * seletor de candidatos quem já é motorista. Pode conter duplicatas se um
 * usuário tiver mais de um registro de driver — quem consome deduplica.
 */
export async function listActiveDriverUserIdsByOrgIdService({ orgId }: { orgId: string }): AppResultAsync<{ userIds: string[] }, "generic_error"> {
	try {
		const { data, error } = await listActiveDriverUserIdsByOrgIdAdminRepo({ orgId })

		if (error) {
			console.error(`${prefixLog} database error`, {
				code: error.code,
				details: error.details,
				hint: error.hint
			})
			return FALLBACK_ERROR
		}

		const userIds = (data ?? []).map((row) => row.user_id)

		return {
			success: true,
			data: { userIds }
		}
	} catch (error) {
		console.error(`${prefixLog} unexpected error:`, error)
		return FALLBACK_ERROR
	}
}

// @/modules/fleet/server/services/list-pending-driver-application-user-ids-by-org-id.service.ts

import type { AppResultAsync } from "@/shared/types/app-result.types"
import { listPendingDriverApplicationUserIdsByOrgIdAdminRepo } from "../repos/list-pending-driver-application-user-ids-by-org-id.admin.repo"

const prefixLog = "[listPendingDriverApplicationUserIdsByOrgIdService]:"

const FALLBACK_ERROR = {
	success: false,
	code: "generic_error"
} as const

/**
 * Lista os user_ids que já têm uma candidatura de motorista pending na organização.
 *
 * Usado pelo contexto de "adicionar candidatura" para sinalizar/desabilitar no
 * seletor de candidatos quem já tem uma candidatura pendente.
 */
export async function listPendingDriverApplicationUserIdsByOrgIdService({ orgId }: { orgId: string }): AppResultAsync<{ userIds: string[] }, "generic_error"> {
	try {
		const { data, error } = await listPendingDriverApplicationUserIdsByOrgIdAdminRepo({ orgId })

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

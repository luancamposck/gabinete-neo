// @/modules/memberships/server/services/list-active-org-members-by-org-id.service.ts

import { listActiveOrgMembersByOrgIdAdminRepo } from "@/modules/memberships/server/repos/list-active-org-members-by-org-id.admin.repo"
import type { ListActiveOrgMembersByOrgIdServiceData } from "@/modules/memberships/shared/types/slices/list-active-org-members-by-org-id.types"
import type { AppResultAsync } from "@/shared/types/app-result.types"

const prefixLog = "[listActiveOrgMembersByOrgIdService]:"

const FALLBACK_ERROR = {
	success: false,
	code: "generic_error"
} as const

/**
 * Lista os membros ativos de uma organização, apenas com dados de identidade
 * (userId, name, username, email).
 *
 * Enxuta de propósito: não carrega profile, role nem invited_by — diferente da
 * listOrganizationMembersWithProfileAndRoleByOrganizationIdService, que serve
 * outras telas. Usada pelo contexto de "adicionar candidatura de motorista".
 */
export async function listActiveOrgMembersByOrgIdService({ orgId }: { orgId: string }): AppResultAsync<ListActiveOrgMembersByOrgIdServiceData, "generic_error"> {
	try {
		const { data, error } = await listActiveOrgMembersByOrgIdAdminRepo({ orgId })

		if (error) {
			console.error(`${prefixLog} database error`, {
				code: error.code,
				details: error.details,
				hint: error.hint
			})
			return FALLBACK_ERROR
		}

		const members = (data ?? []).map((row) => ({
			userId: row.user_id,
			name: row.user.name,
			username: row.user.username,
			email: row.user.email
		}))

		return {
			success: true,
			data: { members }
		}
	} catch (error) {
		console.error(`${prefixLog} unexpected error:`, error)
		return FALLBACK_ERROR
	}
}

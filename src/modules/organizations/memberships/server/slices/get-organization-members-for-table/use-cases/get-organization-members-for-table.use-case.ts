// @/modules/organizations/memberships/server/slices/get-organization-members-for-table/use-cases/get-organization-members-for-table.use-case.ts

import type { OrganizationMemberWithUserProfileAndRole } from "@/modules/organizations/memberships/server/repos/list-organization-members-with-profile-and-role-by-organization-id.repo"
import { listOrganizationMembersWithProfileAndRoleByOrganizationIdService } from "@/modules/organizations/memberships/server/services/list-organization-members-with-profile-and-role-by-organization-id.service"
import { getOrganizationIdByAppDomainAction } from "@/modules/organizations/server/slices/get-organization-id-by-app-domain/actions/get-organization-id-by-app-domain.action"
import { getRequestHost } from "@/shared/http/get-request-host"
import type { OperationResponse } from "@/shared/types/operation-reponse.types"

type GetOrganizationMembersForTableUseCaseRes = {
	host: string
	organizationId: string
	organizationMembers: OrganizationMemberWithUserProfileAndRole[]
}

type ErrorCodes = "org_not_found" | "infra_error"

const prefixLog = "[getOrganizationMembersForTableUseCase]:"

const MSG_ORG_NOT_FOUND = "Não foi possível identificar a organização deste domínio."
const MSG_INFRA_ERROR = "Não foi possível preparar os dados. Tente novamente em instantes."

const FALLBACK_INFRA_ERROR = {
	success: false,
	message: MSG_INFRA_ERROR,
	code: "infra_error"
} as const

export async function getOrganizationMembersForTableUseCase(): OperationResponse<GetOrganizationMembersForTableUseCaseRes, ErrorCodes> {
	try {
		// ============================================================
		// 0) Resolver host (tenant atual via app_domain)
		//
		// Possibilidades:
		// - host ausente => org_not_found (não tem como resolver tenant)
		// ============================================================
		const host = await getRequestHost()
		if (!host) {
			return {
				success: false,
				code: "org_not_found",
				message: MSG_ORG_NOT_FOUND
			}
		}

		// ============================================================
		// 1) Resolver organizationId (tenant atual via app_domain)
		//
		// Possibilidades:
		// - org não encontrada => org_not_found
		// - erro técnico => infra_error
		// ============================================================
		const orgRes = await getOrganizationIdByAppDomainAction({ appDomain: host })
		if (orgRes.success === false) {
			if (orgRes.code === "org_not_found") {
				return {
					success: false,
					code: "org_not_found",
					message: MSG_ORG_NOT_FOUND
				}
			}

			if (orgRes.code === "infra_error") {
				return {
					success: false,
					code: "infra_error",
					message: MSG_INFRA_ERROR
				}
			}

			return FALLBACK_INFRA_ERROR
		}

		const organizationId = orgRes.data.organizationId

		// ============================================================
		// 2) Carregar membros da organização com profile + role
		//
		// Possibilidades:
		// - erro técnico => infra_error
		// - ok => members list (já filtrada por profile)
		// ============================================================
		const membersRes = await listOrganizationMembersWithProfileAndRoleByOrganizationIdService({ organizationId })
		if (membersRes.success === false || !membersRes.data) {
			console.error(`${prefixLog} members load failed:`, membersRes.message)
			return FALLBACK_INFRA_ERROR
		}

		const organizationMembers = membersRes.data.organizationMembers ?? []

		// ============================================================
		// OK: dados prontos para data-table
		// ============================================================
		return {
			success: true,
			message: membersRes.message,
			data: {
				host,
				organizationId,
				organizationMembers
			}
		}
	} catch (error) {
		console.error(`${prefixLog} unexpected error:`, error)
		return FALLBACK_INFRA_ERROR
	}
}

// @/modules/fleet/server/use-cases/get-add-driver-application-context.use-case.ts

import { getCurrentAuthUserService } from "@/modules/auth/server/services/get-current-auth-user.service"
import { hasMembershipPermissionService } from "@/modules/auth/server/services/has-membership-permission.service"
import { PERMISSIONS } from "@/modules/auth/shared/permissions"
import { listActiveOrgMembersByOrgIdService } from "@/modules/memberships/server/services/list-active-org-members-by-org-id.service"
import { getOrganizationIdByAppDomainService } from "@/modules/organizations/server/services/get-organization-id-by-app-domain.service"
import { getRequestHost } from "@/shared/http/get-request-host"
import type { AppResultAsync } from "@/shared/types/app-result.types"
import type { GetAddDriverApplicationContextUseCaseCodes, GetAddDriverApplicationContextUseCaseData } from "../../shared/types/slices/get-add-driver-application-context.types"
import { listActiveDriverUserIdsByOrgIdService } from "../services/list-active-driver-user-ids-by-org-id.service"
import { listPendingDriverApplicationUserIdsByOrgIdService } from "../services/list-pending-driver-application-user-ids-by-org-id.service"

const prefixLog = "[getAddDriverApplicationContextUseCase]:"

export async function getAddDriverApplicationContextUseCase(): AppResultAsync<GetAddDriverApplicationContextUseCaseData, GetAddDriverApplicationContextUseCaseCodes> {
	// ============================================================
	// 1) Autenticar quem está acessando a tela
	// ============================================================
	const currentUserRes = await getCurrentAuthUserService()

	if (currentUserRes.success === false) {
		return {
			success: false,
			code: currentUserRes.code === "unauthenticated" ? "unauthenticated" : "generic_error"
		}
	}

	const userId = currentUserRes.data.user.id

	// ============================================================
	// 2) Resolver a organização pelo domínio atual (app_domain)
	// ============================================================
	const host = await getRequestHost()

	if (!host) {
		console.error(`${prefixLog} missing request host`)
		return {
			success: false,
			code: "org_not_found"
		}
	}

	const orgRes = await getOrganizationIdByAppDomainService({ appDomain: host })

	if (orgRes.success === false) {
		return {
			success: false,
			code: orgRes.code === "infra_error" ? "generic_error" : "org_not_found"
		}
	}

	const orgId = orgRes.data.organizationId

	// ============================================================
	// 3) Guard de permissão: só quem gerencia candidaturas acessa
	// ============================================================
	const permissionRes = await hasMembershipPermissionService({
		organizationId: orgId,
		userId,
		permissionKey: PERMISSIONS.FLEET_APPLICATIONS_MANAGE
	})

	if (permissionRes.success === false) {
		return {
			success: false,
			code: "generic_error"
		}
	}

	if (permissionRes.data.allowed === false) {
		return {
			success: false,
			code: "not_allowed"
		}
	}

	// ============================================================
	// 4) Membros ativos da organização (candidatos em potencial)
	// ============================================================
	const membersRes = await listActiveOrgMembersByOrgIdService({ orgId })

	if (membersRes.success === false) {
		return {
			success: false,
			code: "generic_error"
		}
	}

	// ============================================================
	// 5) Quem já é motorista ativo
	// ============================================================
	const activeDriversRes = await listActiveDriverUserIdsByOrgIdService({ orgId })

	if (activeDriversRes.success === false) {
		return {
			success: false,
			code: "generic_error"
		}
	}

	// ============================================================
	// 6) Quem já tem candidatura pending
	// ============================================================
	const pendingRes = await listPendingDriverApplicationUserIdsByOrgIdService({ orgId })

	if (pendingRes.success === false) {
		return {
			success: false,
			code: "generic_error"
		}
	}

	// ============================================================
	// 7) Projetar candidatos com status (already_driver vence pending)
	// ============================================================
	const activeDriverUserIds = new Set(activeDriversRes.data.userIds)
	const pendingUserIds = new Set(pendingRes.data.userIds)

	const candidates = membersRes.data.members.map((member) => {
		let status: "available" | "already_driver" | "pending" = "available"

		if (activeDriverUserIds.has(member.userId)) {
			status = "already_driver"
		} else if (pendingUserIds.has(member.userId)) {
			status = "pending"
		}

		return {
			userId: member.userId,
			name: member.name,
			username: member.username,
			email: member.email,
			status
		}
	})

	return {
		success: true,
		data: { candidates }
	}
}

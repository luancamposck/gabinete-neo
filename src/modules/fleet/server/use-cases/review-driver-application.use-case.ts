import { getCurrentAuthUserService } from "@/modules/auth/server/services/get-current-auth-user.service"
import { hasMembershipPermissionService } from "@/modules/auth/server/services/has-membership-permission.service"
import { PERMISSIONS } from "@/modules/auth/shared/permissions"
import { approveDriverApplicationService } from "@/modules/fleet/server/services/approve-driver-application.service"
import { getDriverApplicationByIdService } from "@/modules/fleet/server/services/get-driver-application-by-id.service"
import { rejectDriverApplicationService } from "@/modules/fleet/server/services/reject-driver-application.service"
import type { ReviewDriverApplicationAction, ReviewDriverApplicationUseCaseCodes, ReviewDriverApplicationUseCaseData } from "@/modules/fleet/shared/types/slices/review-driver-application.types"
import { getOrganizationIdByAppDomainService } from "@/modules/organizations/server/services/get-organization-id-by-app-domain.service"
import { getRequestHost } from "@/shared/http/get-request-host"
import type { AppResultAsync } from "@/shared/types/app-result.types"

export async function reviewDriverApplicationUseCase(params: { applicationId: string; action: ReviewDriverApplicationAction }): AppResultAsync<ReviewDriverApplicationUseCaseData, ReviewDriverApplicationUseCaseCodes> {
	const { applicationId, action } = params

	// ============================================================
	// 0) Autenticação
	//
	// Possibilidades:
	// - sem user => unauthenticated
	// - erro técnico => generic_error
	// ============================================================
	const authRes = await getCurrentAuthUserService()
	if (authRes.success === false) {
		return {
			success: false,
			code: authRes.code === "unauthenticated" ? "unauthenticated" : "generic_error"
		}
	}

	const reviewerUserId = authRes.data.user.id

	// ============================================================
	// 1) Resolução do tenant (via app_domain do host)
	//
	// Possibilidades:
	// - host ausente ou org não encontrada => org_not_found
	// - erro técnico => generic_error
	// ============================================================
	const host = await getRequestHost()
	if (!host) {
		return {
			success: false,
			code: "org_not_found"
		}
	}

	const orgRes = await getOrganizationIdByAppDomainService({ appDomain: host })
	if (orgRes.success === false) {
		return {
			success: false,
			code: orgRes.code === "org_not_found" ? "org_not_found" : "generic_error"
		}
	}

	const organizationId = orgRes.data.organizationId

	// ============================================================
	// 2) Guard de permissão para gerir candidaturas de frota
	//
	// Possibilidades:
	// - erro técnico => generic_error
	// - sem permissão => not_allowed
	// ============================================================
	const permissionRes = await hasMembershipPermissionService({
		organizationId,
		userId: reviewerUserId,
		permissionKey: PERMISSIONS.FLEET_APPLICATIONS_MANAGE
	})

	if (permissionRes.success === false) {
		return { success: false, code: "generic_error" }
	}

	if (permissionRes.data.allowed === false) {
		return { success: false, code: "not_allowed" }
	}

	// ============================================================
	// 3) Carregar a candidatura e validar escopo/idempotência
	//
	// Possibilidades:
	// - inexistente, outra org => not_found (não vaza existência cross-org)
	// - erro técnico => generic_error
	// - status diferente de pending => already_reviewed
	// ============================================================
	const applicationRes = await getDriverApplicationByIdService({ applicationId })
	if (applicationRes.success === false) {
		return applicationRes
	}

	const application = applicationRes.data

	if (application.organization_id !== organizationId) {
		return { success: false, code: "not_found" }
	}

	if (application.status !== "pending") {
		return { success: false, code: "already_reviewed" }
	}

	// ============================================================
	// 4) Aplicar a revisão
	//
	// - approve: RPC transacional cria drivers e marca approved.
	// - reject: update com guard status = pending, sem alterar membership.
	// ============================================================
	if (action === "approve") {
		const approveRes = await approveDriverApplicationService({ applicationId, reviewerUserId })
		if (approveRes.success === false) {
			if (approveRes.code === "not_found" || approveRes.code === "already_reviewed") {
				return approveRes
			}

			return { success: false, code: "generic_error" }
		}

		return {
			success: true,
			data: {
				applicationId,
				action,
				driverId: approveRes.data.driverId
			}
		}
	}

	const rejectRes = await rejectDriverApplicationService({ applicationId, reviewerUserId })
	if (rejectRes.success === false) {
		if (rejectRes.code === "already_reviewed") {
			return rejectRes
		}

		return { success: false, code: "generic_error" }
	}

	return {
		success: true,
		data: {
			applicationId,
			action,
			driverId: null
		}
	}
}

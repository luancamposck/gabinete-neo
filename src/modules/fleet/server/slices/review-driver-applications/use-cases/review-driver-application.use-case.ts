// @/modules/fleet/server/slices/review-driver-applications/use-cases/review-driver-application.use-case.ts

import { getCurrentAuthUserService } from "@/modules/auth/server/services/get-current-auth-user.service"
import { hasMembershipPermissionService } from "@/modules/auth/server/services/has-membership-permission.service"
import { getDriverApplicationByIdRepo } from "@/modules/fleet/server/repos/get-driver-application-by-id.repo"
import { approveDriverApplicationService } from "@/modules/fleet/server/services/approve-driver-application.service"
import { rejectDriverApplicationService } from "@/modules/fleet/server/services/reject-driver-application.service"
import { getOrganizationIdByAppDomainService } from "@/modules/organizations/server/services/get-organization-id-by-app-domain.service"
import { getRequestHost } from "@/shared/http/get-request-host"
import type { OperationResponse } from "@/shared/types/operation-response.types"

export type ReviewDriverApplicationAction = "approve" | "reject"

type ReviewDriverApplicationUseCaseParams = {
	applicationId: string
	action: ReviewDriverApplicationAction
}

type ReviewDriverApplicationUseCaseRes = {
	applicationId: string
	action: ReviewDriverApplicationAction
	driverId: string | null
}

type ErrorCodes = "unauthenticated" | "org_not_found" | "not_allowed" | "not_found" | "already_reviewed" | "infra_error"

const prefixLog = "[reviewDriverApplicationUseCase]:"

const MSG_SUCCESS_APPROVED = "Candidatura aprovada com sucesso."
const MSG_SUCCESS_REJECTED = "Candidatura rejeitada com sucesso."
const MSG_UNAUTHENTICATED = "Você precisa estar autenticado para continuar."
const MSG_ORG_NOT_FOUND = "Não foi possível identificar a organização deste domínio."
const MSG_NOT_ALLOWED = "Você não tem permissão para gerir candidaturas de frota."
const MSG_NOT_FOUND = "Candidatura não encontrada."
const MSG_ALREADY_REVIEWED = "Esta candidatura já foi revisada."
const MSG_INFRA_ERROR = "Não foi possível revisar a candidatura. Tente novamente em instantes."

const FALLBACK_INFRA_ERROR = {
	success: false,
	message: MSG_INFRA_ERROR,
	code: "infra_error"
} as const

export async function reviewDriverApplicationUseCase(params: ReviewDriverApplicationUseCaseParams): OperationResponse<ReviewDriverApplicationUseCaseRes, ErrorCodes> {
	const { applicationId, action } = params

	try {
		// ============================================================
		// 0) Autenticação
		//
		// Possibilidades:
		// - sem user => unauthenticated
		// - erro técnico => infra_error
		// ============================================================
		const authRes = await getCurrentAuthUserService()
		if (authRes.success === false) {
			if (authRes.code === "unauthenticated") {
				return {
					success: false,
					code: "unauthenticated",
					message: MSG_UNAUTHENTICATED
				}
			}

			return FALLBACK_INFRA_ERROR
		}

		const reviewerUserId = authRes.data.user.id

		// ============================================================
		// 1) Resolução do tenant (via app_domain do host)
		//
		// Possibilidades:
		// - host ausente => org_not_found
		// - org não encontrada => org_not_found
		// - erro técnico => infra_error
		// ============================================================
		const host = await getRequestHost()
		if (!host) {
			return {
				success: false,
				code: "org_not_found",
				message: MSG_ORG_NOT_FOUND
			}
		}

		const orgRes = await getOrganizationIdByAppDomainService({ appDomain: host })
		if (orgRes.success === false) {
			if (orgRes.code === "org_not_found") {
				return {
					success: false,
					code: "org_not_found",
					message: MSG_ORG_NOT_FOUND
				}
			}

			return FALLBACK_INFRA_ERROR
		}

		const organizationId = orgRes.data.organizationId

		// ============================================================
		// 2) Guard de permissão (fleet.applications.manage)
		//
		// Possibilidades:
		// - erro técnico => infra_error
		// - sem permissão => not_allowed
		// - com permissão => ok
		// ============================================================
		const permissionRes = await hasMembershipPermissionService({
			organizationId,
			userId: reviewerUserId,
			permissionKey: "fleet.applications.manage"
		})

		if (permissionRes.success === false) {
			return FALLBACK_INFRA_ERROR
		}

		if (permissionRes.data.allowed === false) {
			return {
				success: false,
				code: "not_allowed",
				message: MSG_NOT_ALLOWED
			}
		}

		// ============================================================
		// 3) Carregar a candidatura e validar escopo/idempotência
		//
		// Possibilidades:
		// - erro técnico => infra_error
		// - inexistente OU de outra org => not_found (não vazar existência cross-org)
		// - status diferente de pending => already_reviewed
		// ============================================================
		const { data: application, error: applicationError } = await getDriverApplicationByIdRepo({ applicationId })

		if (applicationError) {
			console.error(`${prefixLog} load application failed:`, applicationError.message)
			return FALLBACK_INFRA_ERROR
		}

		if (!application || application.organization_id !== organizationId) {
			return {
				success: false,
				code: "not_found",
				message: MSG_NOT_FOUND
			}
		}

		if (application.status !== "pending") {
			return {
				success: false,
				code: "already_reviewed",
				message: MSG_ALREADY_REVIEWED
			}
		}

		// ============================================================
		// 4) Aplicar a revisão (aprovar ou rejeitar)
		//
		// - approve: RPC transacional cria o registro em drivers e marca approved.
		// - reject: update com guard de status = pending (idempotência); NÃO
		//   altera a membership do usuário (permanece membro).
		// - Mapeia not_found/already_reviewed/infra_error dos services.
		// ============================================================
		if (action === "approve") {
			const approveRes = await approveDriverApplicationService({ applicationId, reviewerUserId })
			if (approveRes.success === false) {
				if (approveRes.code === "not_found") {
					return { success: false, code: "not_found", message: MSG_NOT_FOUND }
				}
				if (approveRes.code === "already_reviewed") {
					return { success: false, code: "already_reviewed", message: MSG_ALREADY_REVIEWED }
				}

				return FALLBACK_INFRA_ERROR
			}

			return {
				success: true,
				message: MSG_SUCCESS_APPROVED,
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
				return { success: false, code: "already_reviewed", message: MSG_ALREADY_REVIEWED }
			}

			return FALLBACK_INFRA_ERROR
		}

		return {
			success: true,
			message: MSG_SUCCESS_REJECTED,
			data: {
				applicationId,
				action,
				driverId: null
			}
		}
	} catch (error) {
		console.error(`${prefixLog} unexpected error:`, error)
		return FALLBACK_INFRA_ERROR
	}
}

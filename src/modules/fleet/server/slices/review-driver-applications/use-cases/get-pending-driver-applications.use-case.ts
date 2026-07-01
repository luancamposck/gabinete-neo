// @/modules/fleet/server/slices/review-driver-applications/use-cases/get-pending-driver-applications.use-case.ts

import { getCurrentAuthUserService } from "@/modules/auth/server/services/get-current-auth-user.service"
import { hasMembershipPermissionService } from "@/modules/auth/server/services/has-membership-permission.service"
import { createDriverDocumentSignedUrlService } from "@/modules/fleet/server/services/create-driver-document-signed-url.service"
import { listPendingDriverApplicationsService } from "@/modules/fleet/server/services/list-pending-driver-applications.service"
import type { VehicleType } from "@/modules/fleet/shared/constants/vehicle-types"
import { getOrganizationIdByAppDomainService } from "@/modules/organizations/server/services/get-organization-id-by-app-domain.service"
import { getRequestHost } from "@/shared/http/get-request-host"
import type { OperationResponse } from "@/shared/types/operation-response.types"

export type PendingDriverApplicationDTO = {
	applicationId: string
	candidate: {
		id: string
		name: string
		email: string
	} | null
	plate: string
	vehicleType: VehicleType
	vehicleModel: string | null
	vehicleYear: number | null
	vehicleColor: string | null
	crlvSignedUrl: string | null
	cnhSignedUrl: string | null
	createdAt: string
}

type GetPendingDriverApplicationsUseCaseRes = {
	organizationId: string
	applications: PendingDriverApplicationDTO[]
}

type ErrorCodes = "unauthenticated" | "org_not_found" | "not_allowed" | "infra_error"

const prefixLog = "[getPendingDriverApplicationsUseCase]:"

const MSG_SUCCESS = "Candidaturas pendentes carregadas com sucesso."
const MSG_UNAUTHENTICATED = "Você precisa estar autenticado para continuar."
const MSG_ORG_NOT_FOUND = "Não foi possível identificar a organização deste domínio."
const MSG_NOT_ALLOWED = "Você não tem permissão para gerir candidaturas de frota."
const MSG_INFRA_ERROR = "Não foi possível carregar as candidaturas. Tente novamente em instantes."

const FALLBACK_INFRA_ERROR = {
	success: false,
	message: MSG_INFRA_ERROR,
	code: "infra_error"
} as const

export async function getPendingDriverApplicationsUseCase(): OperationResponse<GetPendingDriverApplicationsUseCaseRes, ErrorCodes> {
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

		const userId = authRes.data.user.id

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
			userId,
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
		// 3) Listar candidaturas pendentes da org
		//
		// Possibilidades:
		// - erro técnico => infra_error
		// - sucesso => lista de candidaturas com dados do candidato/veículo
		// ============================================================
		const listRes = await listPendingDriverApplicationsService({ organizationId })
		if (listRes.success === false) {
			console.error(`${prefixLog} list failed:`, listRes.message)
			return FALLBACK_INFRA_ERROR
		}

		// ============================================================
		// 4) Gerar signed URLs (TTL 300s) para CRLV/CNH
		//
		// - Não expõe paths crus ao cliente; apenas signed URLs temporárias.
		// - Best-effort: se a assinatura de um documento falhar, mantém null
		//   para não bloquear a listagem inteira.
		// ============================================================
		const applications: PendingDriverApplicationDTO[] = await Promise.all(
			listRes.data.applications.map(async (application) => {
				const [crlvRes, cnhRes] = await Promise.all([createDriverDocumentSignedUrlService({ path: application.crlv_document_path }), createDriverDocumentSignedUrlService({ path: application.cnh_document_path })])

				return {
					applicationId: application.id,
					candidate: application.candidate,
					plate: application.plate,
					vehicleType: application.vehicle_type as VehicleType,
					vehicleModel: application.vehicle_model,
					vehicleYear: application.vehicle_year,
					vehicleColor: application.vehicle_color,
					crlvSignedUrl: crlvRes.success ? crlvRes.data.signedUrl : null,
					cnhSignedUrl: cnhRes.success ? cnhRes.data.signedUrl : null,
					createdAt: application.created_at
				}
			})
		)

		return {
			success: true,
			message: MSG_SUCCESS,
			data: {
				organizationId,
				applications
			}
		}
	} catch (error) {
		console.error(`${prefixLog} unexpected error:`, error)
		return FALLBACK_INFRA_ERROR
	}
}

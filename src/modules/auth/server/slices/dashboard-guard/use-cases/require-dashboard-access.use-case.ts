// @/modules/auth/server/slices/dashboard-guard/use-cases/require-dashboard-access.use-case.ts

import { getCurrentAuthUserService } from "@/modules/auth/server/services/get-current-auth-user.service"

import { isUserMemberOfOrganizationService } from "@/modules/organizations/memberships/server/services/is-user-member-of-organization.service"
import { getOrganizationIdByAppDomainService } from "@/modules/organizations/server/services/get-organization-id-by-app-domain.service"

import { getRequestHost } from "@/shared/http/get-request-host"
import type { OperationResponse } from "@/shared/types/operation-reponse.types"

type RequireDashboardAccessUseCaseRes = {
	host: string
	organizationId: string
	userId: string
}

type RequireDashboardAccessCode = "unauthenticated" | "org_not_found" | "not_member" | "infra_error"

const prefixLog = "[requireDashboardAccessUseCase]:"

const MSG_ORG_NOT_FOUND = "Não foi possível identificar a organização deste domínio."
const MSG_UNAUTHENTICATED = "Você precisa estar autenticado para acessar o dashboard."
const MSG_NOT_MEMBER = "Você não tem acesso a essa organização."
const MSG_INFRA_ERROR = "Não foi possível validar seu acesso. Tente novamente em instantes."

const FALLBACK_INFRA_ERROR = {
	success: false,
	message: MSG_INFRA_ERROR,
	code: "infra_error"
} as const

export async function requireDashboardAccessUseCase(): OperationResponse<RequireDashboardAccessUseCaseRes, RequireDashboardAccessCode> {
	try {
		// ============================================================
		// 0) Resolver host + organizationId (tenant atual via app_domain)
		//
		// Possibilidades:
		// - host ausente => org_not_found (não tem como resolver tenant)
		// - org não encontrada / erro => aqui tratamos como org_not_found
		//   (se quiser diferenciar infra vs not_found, a service precisa expor code)
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
		// 1) Obter usuário autenticado
		//
		// Possibilidades:
		// - sem user => unauthenticated (layout redireciona pro login)
		// - erro técnico => infra_error (layout pode cair no error boundary)
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

			if (authRes.code === "infra_error") {
				return {
					success: false,
					code: "infra_error",
					message: MSG_INFRA_ERROR
				}
			}

			return FALLBACK_INFRA_ERROR
		}

		const userId = authRes.data.user.id

		// ============================================================
		// 2) Verificar membership do user na org atual
		//
		// Possibilidades:
		// - erro técnico => infra_error
		// - não é membro => forbidden (+ signOut best-effort)
		// - é membro => ok
		// ============================================================
		const membershipRes = await isUserMemberOfOrganizationService({ organizationId, userId })

		if (membershipRes.success === false) {
			console.error(`${prefixLog} membership check failed:`, membershipRes.message)
			return FALLBACK_INFRA_ERROR
		}

		if (membershipRes.data.isMember === false) {
			return {
				success: false,
				code: "not_member",
				message: MSG_NOT_MEMBER
			}
		}

		// ============================================================
		// OK: acesso permitido
		// ============================================================
		return {
			success: true,
			message: "Acesso ao dashboard permitido.",
			data: { host, organizationId, userId }
		}
	} catch (error) {
		console.error(`${prefixLog} unexpected error:`, error)
		return FALLBACK_INFRA_ERROR
	}
}

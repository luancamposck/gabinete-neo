// @/modules/app-shell/server/slices/get-sidebar-context/use-cases/get-sidebar-context.use-case.ts

import { getUserByIdService } from "@/modules/accounts/users/server/services/get-user-by-id.service"
import { getCurrentAuthUserService } from "@/modules/auth/server/services/get-current-auth-user.service"
import { hasMembershipPermissionService } from "@/modules/auth/server/services/has-membership-permission.service"
import type { PermissionKey } from "@/modules/auth/shared/permissions"
import { getOrganizationIdByAppDomainService } from "@/modules/organizations/server/services/get-organization-id-by-app-domain.service"
import { getRequestHost } from "@/shared/http/get-request-host"
import type { OperationResponse } from "@/shared/types/operation-reponse.types"

type GetSidebarContextUseCaseRes = {
	user: {
		name: string
		email: string
		username: string
	}
	allowed: boolean
}

type GetSidebarContextCode = "unauthenticated" | "org_not_found" | "infra_error"

type Params = {
	permissionKey: PermissionKey
}

const prefixLog = "[getSidebarContextUseCase]:"

const MSG_ORG_NOT_FOUND = "Não foi possível identificar a organização deste domínio."
const MSG_UNAUTHENTICATED = "Você precisa estar autenticado para continuar."
const MSG_NOT_ALLOWED = "Você não tem permissão para acessar este recurso."
const MSG_ALLOWED = "Permissão validada com sucesso."
const MSG_INFRA_ERROR = "Não foi possível validar seu acesso. Tente novamente em instantes."

const FALLBACK_INFRA_ERROR = {
	success: false,
	message: MSG_INFRA_ERROR,
	code: "infra_error"
} as const

export async function getSidebarContextUseCase(params: Params): OperationResponse<GetSidebarContextUseCaseRes, GetSidebarContextCode> {
	try {
		// ============================================================
		// 0) Obter usuário autenticado
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
		// 1) Resolver host (tenant atual via app_domain)
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
		// 2) Resolver organizationId (tenant atual via app_domain)
		//
		// Possibilidades:
		// - org não encontrada => org_not_found
		// - erro técnico => infra_error
		// ============================================================
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
		// 3) Verificar permissão da membership na org atual
		//
		// Possibilidades:
		// - erro técnico => infra_error
		// - não tem permissão => allowed=false
		// - tem permissão => ok
		// ============================================================
		const permissionRes = await hasMembershipPermissionService({
			organizationId,
			userId,
			permissionKey: params.permissionKey
		})

		if (permissionRes.success === false) {
			console.error(`${prefixLog} permission check failed:`, permissionRes.message)
			return FALLBACK_INFRA_ERROR
		}

		const userRes = await getUserByIdService({ userId })

		if (userRes.success === false) {
			return FALLBACK_INFRA_ERROR
		}

		// ============================================================
		// OK: contexto resolvido
		// ============================================================
		const { allowed } = permissionRes.data

		return {
			success: true,
			message: allowed ? MSG_ALLOWED : MSG_NOT_ALLOWED,
			data: {
				user: userRes.data.user,
				allowed
			}
		}
	} catch (error) {
		console.error(`${prefixLog} unexpected error:`, error)
		return FALLBACK_INFRA_ERROR
	}
}

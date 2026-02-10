// @/modules/app-shell/server/slices/get-sidebar-context/use-cases/get-sidebar-context.use-case.ts

import { getUserByIdService } from "@/modules/accounts/users/server/services/get-user-by-id.service"
import { getCurrentAuthUserService } from "@/modules/auth/server/services/get-current-auth-user.service"
import { listMembershipPermissionsService } from "@/modules/auth/server/services/list-membership-permissions.service"
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
	permissionKeys: PermissionKey[]
}

type GetSidebarContextCode = "unauthenticated" | "org_not_found" | "infra_error"

const prefixLog = "[getSidebarContextUseCase]:"

const MSG_ORG_NOT_FOUND = "Não foi possível identificar a organização deste domínio."
const MSG_UNAUTHENTICATED = "Você precisa estar autenticado para continuar."
const MSG_SUCCESS = "Contexto da sidebar carregado com sucesso."
const MSG_INFRA_ERROR = "Não foi possível validar seu acesso. Tente novamente em instantes."

const FALLBACK_INFRA_ERROR = {
	success: false,
	message: MSG_INFRA_ERROR,
	code: "infra_error"
} as const

export async function getSidebarContextUseCase(): OperationResponse<GetSidebarContextUseCaseRes, GetSidebarContextCode> {
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
		// 3) Listar permissões da membership na org atual
		//
		// Possibilidades:
		// - erro técnico => infra_error
		// - sucesso => permissionKeys disponíveis para controle de UI
		// ============================================================
		const permissionsRes = await listMembershipPermissionsService({
			organizationId,
			userId
		})

		if (permissionsRes.success === false) {
			console.error(`${prefixLog} list permissions failed:`, permissionsRes.message)
			return FALLBACK_INFRA_ERROR
		}

		const userRes = await getUserByIdService({ userId })

		if (userRes.success === false) {
			return FALLBACK_INFRA_ERROR
		}

		// ============================================================
		// OK: contexto resolvido
		// ============================================================
		return {
			success: true,
			message: MSG_SUCCESS,
			data: {
				user: userRes.data.user,
				permissionKeys: permissionsRes.data.permissionKeys
			}
		}
	} catch (error) {
		console.error(`${prefixLog} unexpected error:`, error)
		return FALLBACK_INFRA_ERROR
	}
}

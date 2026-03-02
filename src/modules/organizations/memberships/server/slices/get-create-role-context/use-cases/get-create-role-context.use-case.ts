// @/modules/organizations/memberships/server/slices/get-create-role-context/use-cases/get-create-role-context.use-case.ts

import { getCurrentAuthUserService } from "@/modules/auth/server/services/get-current-auth-user.service"
import { hasMembershipPermissionService } from "@/modules/auth/server/services/has-membership-permission.service"
import { listPermissionsService } from "@/modules/auth/server/services/list-permissions.service"
import { PERMISSIONS } from "@/modules/auth/shared/permissions"
import { getOrganizationByIdService } from "@/modules/organizations/server/services/get-organization-by-id.service"
import { getOrganizationIdByAppDomainService } from "@/modules/organizations/server/services/get-organization-id-by-app-domain.service"
import { getRequestHost } from "@/shared/http/get-request-host"
import type { OperationResponse } from "@/shared/types/operation-response.types"

type PermissionCatalogItem = {
	id: string
	key: string
	description: string
}

type GetCreateRoleContextUseCaseRes = {
	organization: {
		id: string
		name: string
	}
	availablePermissions: PermissionCatalogItem[]
}

type ErrorCodes = "unauthenticated" | "org_not_found" | "not_allowed" | "infra_error"

const prefixLog = "[getCreateRoleContextUseCase]:"

const MSG_ORG_NOT_FOUND = "Não foi possível identificar a organização deste domínio."
const MSG_UNAUTHENTICATED = "Você precisa estar autenticado para continuar."
const MSG_NOT_ALLOWED = "Você não tem permissão para criar cargos na organização."
const MSG_INFRA_ERROR = "Não foi possível carregar o contexto para criação de cargo. Tente novamente em instantes."
const PRIVILEGED_PERMISSION_SUFFIX = ".privileged"

const FALLBACK_INFRA_ERROR = {
	success: false,
	message: MSG_INFRA_ERROR,
	code: "infra_error"
} as const

export async function getCreateRoleContextUseCase(): OperationResponse<GetCreateRoleContextUseCaseRes, ErrorCodes> {
	try {
		// ============================================================
		// 0) Obter usuário autenticado
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

		const currentUserId = authRes.data.user.id

		// ============================================================
		// 1) Resolver host + organizationId (tenant atual via app_domain)
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

		const { organizationId } = orgRes.data

		// ============================================================
		// 2) Verificar permissão para criar/editar cargos (roles.update)
		//
		// Possibilidades:
		// - erro técnico => infra_error
		// - sem permissão => not_allowed
		// - com permissão => seguir fluxo
		// ============================================================
		const permissionRes = await hasMembershipPermissionService({
			organizationId,
			userId: currentUserId,
			permissionKey: PERMISSIONS.ROLES_UPDATE
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
		// 3) Carregar organização pelo organizationId
		//
		// Possibilidades:
		// - org não encontrada => org_not_found
		// - erro técnico => infra_error
		// - sucesso => dados da organização para contexto da tela
		// ============================================================
		const organizationRes = await getOrganizationByIdService({ organizationId })
		if (organizationRes.success === false) {
			if (organizationRes.code === "org_not_found") {
				return {
					success: false,
					code: "org_not_found",
					message: MSG_ORG_NOT_FOUND
				}
			}

			return FALLBACK_INFRA_ERROR
		}

		// ============================================================
		// 4) Carregar catálogo real de permissões disponíveis
		//
		// Possibilidades:
		// - erro técnico => infra_error
		// - sucesso => availablePermissions para renderização do formulário
		// ============================================================
		const permissionsCatalogRes = await listPermissionsService()
		if (permissionsCatalogRes.success === false) {
			return FALLBACK_INFRA_ERROR
		}

		const availablePermissions = permissionsCatalogRes.data.permissions.filter((permission) => !permission.key.endsWith(PRIVILEGED_PERMISSION_SUFFIX))

		// ============================================================
		// OK: contexto da página de criação de cargo carregado
		// ============================================================
		return {
			success: true,
			message: "Contexto de criação de cargo carregado com sucesso.",
			data: {
				organization: {
					id: organizationRes.data.organization.id,
					name: organizationRes.data.organization.name
				},
				availablePermissions
			}
		}
	} catch (error) {
		console.error(`${prefixLog} unexpected error:`, error)
		return FALLBACK_INFRA_ERROR
	}
}

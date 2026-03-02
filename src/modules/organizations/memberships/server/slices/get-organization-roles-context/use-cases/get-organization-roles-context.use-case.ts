import { getCurrentAuthUserService } from "@/modules/auth/server/services/get-current-auth-user.service"
import { hasMembershipPermissionService } from "@/modules/auth/server/services/has-membership-permission.service"
import { listMembershipPermissionsService } from "@/modules/auth/server/services/list-membership-permissions.service"
import { listPermissionsService } from "@/modules/auth/server/services/list-permissions.service"
import { PERMISSIONS, type PermissionKey } from "@/modules/auth/shared/permissions"
import { getMembershipByOrgAndUserIdWithRoleService } from "@/modules/organizations/memberships/server/services/get-membership-by-org-and-user-id-with-role.service"
import { listRolesWithPermissionsByOrganizationIdService } from "@/modules/organizations/memberships/server/services/list-roles-with-permissions-by-organization-id.service"
import { getOrganizationByIdService } from "@/modules/organizations/server/services/get-organization-by-id.service"
import { getOrganizationIdByAppDomainService } from "@/modules/organizations/server/services/get-organization-id-by-app-domain.service"
import type { OrganizationView } from "@/modules/organizations/shared/types/views"
import { getRequestHost } from "@/shared/http/get-request-host"
import type { OperationResponse } from "@/shared/types/operation-response.types"

type RolePermission = {
	id: string
	key: string
	description: string
}

type OrganizationRoleWithPermissions = {
	id: string
	name: string
	is_active: boolean
	is_system: boolean
	permissions: RolePermission[]
}

type GetOrganizationRolesContextUseCaseRes = {
	organization: OrganizationView
	roles: OrganizationRoleWithPermissions[]
	permissionsKeys: PermissionKey[]
	availablePermissions: RolePermission[]
	isCurrentUserOwner: boolean
}

type ErrorCodes = "unauthenticated" | "org_not_found" | "not_allowed" | "infra_error"

const prefixLog = "[getOrganizationRolesContextUseCase]:"

const MSG_ORG_NOT_FOUND = "Não foi possível identificar a organização deste domínio."
const MSG_UNAUTHENTICATED = "Você precisa estar autenticado para continuar."
const MSG_NOT_ALLOWED = "Você não tem permissão para visualizar cargos da organização."
const MSG_INFRA_ERROR = "Não foi possível carregar os cargos da organização. Tente novamente em instantes."

const FALLBACK_INFRA_ERROR = {
	success: false,
	message: MSG_INFRA_ERROR,
	code: "infra_error"
} as const

const isOwnerRole = (roleName: string) => roleName.trim().toUpperCase() === "OWNER"

export async function getOrganizationRolesContextUseCase(): OperationResponse<GetOrganizationRolesContextUseCaseRes, ErrorCodes> {
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

			if (authRes.code === "infra_error") {
				return FALLBACK_INFRA_ERROR
			}

			return FALLBACK_INFRA_ERROR
		}

		const userId = authRes.data.user.id

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
		// 2) Validar permissão para leitura de cargos da organização
		//
		// Possibilidades:
		// - erro técnico => infra_error
		// - sem permissão => not_allowed
		// - com permissão => seguir fluxo
		// ============================================================
		const permissionCheckRes = await hasMembershipPermissionService({
			organizationId,
			userId,
			permissionKey: PERMISSIONS.ORG_ROLES_READ
		})

		if (permissionCheckRes.success === false) {
			return FALLBACK_INFRA_ERROR
		}

		if (permissionCheckRes.data.allowed === false) {
			return {
				success: false,
				code: "not_allowed",
				message: MSG_NOT_ALLOWED
			}
		}

		// ============================================================
		// 3) Carregar membership atual para derivar se usuário é OWNER
		//
		// Possibilidades:
		// - membership não encontrada => not_allowed
		// - erro técnico => infra_error
		// - sucesso => isCurrentUserOwner disponível para UI
		// ============================================================
		const currentMembershipRes = await getMembershipByOrgAndUserIdWithRoleService({
			organizationId,
			userId
		})
		if (currentMembershipRes.success === false) {
			if (currentMembershipRes.code === "membership_not_found") {
				return {
					success: false,
					code: "not_allowed",
					message: MSG_NOT_ALLOWED
				}
			}

			return FALLBACK_INFRA_ERROR
		}

		const isCurrentUserOwner = isOwnerRole(currentMembershipRes.data.roleName)

		// ============================================================
		// 4) Carregar organização alvo pelo organizationId
		//
		// Possibilidades:
		// - org não encontrada => org_not_found
		// - erro técnico => infra_error
		// - sucesso => organização disponível para o contexto
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
		// 5) Listar cargos da organização com suas permissões
		//
		// Possibilidades:
		// - erro técnico => infra_error
		// - sucesso => roles disponíveis para renderização
		// ============================================================
		const rolesRes = await listRolesWithPermissionsByOrganizationIdService({ organizationId })
		if (rolesRes.success === false) {
			return FALLBACK_INFRA_ERROR
		}

		// ============================================================
		// 6) Listar permissões do membership atual (usuário autenticado)
		//
		// Possibilidades:
		// - erro técnico => infra_error
		// - sucesso => permissionKeys para habilitar ações na UI
		// ============================================================
		const membershipPermissionsRes = await listMembershipPermissionsService({
			organizationId,
			userId
		})

		if (membershipPermissionsRes.success === false) {
			return FALLBACK_INFRA_ERROR
		}

		// ============================================================
		// 7) Carregar catálogo de permissões disponíveis para edição
		//
		// Possibilidades:
		// - erro técnico => infra_error
		// - sucesso => availablePermissions para formulário de edição
		// ============================================================
		const permissionsCatalogRes = await listPermissionsService()
		if (permissionsCatalogRes.success === false) {
			return FALLBACK_INFRA_ERROR
		}

		// ============================================================
		// OK: contexto de cargos carregado
		// ============================================================
		return {
			success: true,
			message: "Contexto de cargos carregado com sucesso.",
			data: {
				organization: organizationRes.data.organization,
				roles: rolesRes.data.roles,
				permissionsKeys: membershipPermissionsRes.data.permissionKeys,
				availablePermissions: permissionsCatalogRes.data.permissions,
				isCurrentUserOwner
			}
		}
	} catch (error) {
		console.error(`${prefixLog} unexpected error:`, error)
		return FALLBACK_INFRA_ERROR
	}
}

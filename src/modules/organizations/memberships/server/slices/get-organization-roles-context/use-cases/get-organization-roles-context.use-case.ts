import { getCurrentAuthUserService } from "@/modules/auth/server/services/get-current-auth-user.service"
import { hasMembershipPermissionService } from "@/modules/auth/server/services/has-membership-permission.service"
import { listMembershipPermissionsService } from "@/modules/auth/server/services/list-membership-permissions.service"
import { PERMISSIONS, type PermissionKey } from "@/modules/auth/shared/permissions"
import { listRolesWithPermissionsByOrganizationIdService } from "@/modules/organizations/memberships/server/services/list-roles-with-permissions-by-organization-id.service"
import { getOrganizationByIdService } from "@/modules/organizations/server/services/get-organization-by-id.service"
import { getOrganizationIdByAppDomainService } from "@/modules/organizations/server/services/get-organization-id-by-app-domain.service"
import type { OrganizationView } from "@/modules/organizations/shared/types/views"
import { getRequestHost } from "@/shared/http/get-request-host"
import type { OperationResponse } from "@/shared/types/operation-reponse.types"

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

export async function getOrganizationRolesContextUseCase(): OperationResponse<GetOrganizationRolesContextUseCaseRes, ErrorCodes> {
	try {
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

		const rolesRes = await listRolesWithPermissionsByOrganizationIdService({ organizationId })
		if (rolesRes.success === false) {
			return FALLBACK_INFRA_ERROR
		}

		const membershipPermissionsRes = await listMembershipPermissionsService({
			organizationId,
			userId
		})

		if (membershipPermissionsRes.success === false) {
			return FALLBACK_INFRA_ERROR
		}

		return {
			success: true,
			message: "Contexto de cargos carregado com sucesso.",
			data: {
				organization: organizationRes.data.organization,
				roles: rolesRes.data.roles,
				permissionsKeys: membershipPermissionsRes.data.permissionKeys
			}
		}
	} catch (error) {
		console.error(`${prefixLog} unexpected error:`, error)
		return FALLBACK_INFRA_ERROR
	}
}

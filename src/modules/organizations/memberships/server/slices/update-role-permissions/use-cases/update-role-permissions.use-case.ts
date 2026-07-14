import { getCurrentAuthUserService } from "@/modules/auth/server/services/get-current-auth-user.service"
import { hasMembershipPermissionService } from "@/modules/auth/server/services/has-membership-permission.service"
import { listPermissionsService } from "@/modules/auth/server/services/list-permissions.service"
import { PERMISSIONS } from "@/modules/auth/shared/permissions"
import { getMembershipByOrgAndUserIdWithRoleService } from "@/modules/organizations/memberships/server/services/get-membership-by-org-and-user-id-with-role.service"
import { listRolesByOrganizationIdService } from "@/modules/organizations/memberships/server/services/list-roles-by-organization-id.service"
import { syncRolePermissionsService } from "@/modules/organizations/memberships/server/services/sync-role-permissions.service"
import { getOrganizationIdByAppDomainService } from "@/modules/organizations/server/services/get-organization-id-by-app-domain.service"
import { getRequestHost } from "@/shared/http/get-request-host"
import type { OperationResponse } from "@/shared/types/operation-response.types"

type UpdateRolePermissionsUseCaseParams = {
	roleId: string
	permissionKeys: string[]
}

type ErrorCodes = "unauthenticated" | "org_not_found" | "forbidden" | "role_not_found" | "role_not_editable" | "invalid_permissions" | "privileged_permission_not_allowed" | "infra_error"

const MSG_ORG_NOT_FOUND = "Não foi possível identificar a organização deste domínio."
const MSG_UNAUTHENTICATED = "Você precisa estar autenticado para continuar."
const MSG_FORBIDDEN = "Você não tem permissão para editar permissões de cargos."
const MSG_FORBIDDEN_ADMIN_ROLE = "Apenas OWNER pode editar permissões do cargo ADMIN."
const MSG_ROLE_NOT_FOUND = "O cargo informado não existe ou está inativo nesta organização."
const MSG_ROLE_NOT_EDITABLE = "O cargo OWNER não pode ser editado nesta tela."
const MSG_INVALID_PERMISSIONS = "A solicitação contém permissões inválidas para este ambiente."
const MSG_PRIVILEGED_NOT_ALLOWED = "Apenas OWNER pode ter permissões privilegiadas."
const MSG_INFRA_ERROR = "Não foi possível atualizar permissões do cargo. Tente novamente em instantes."

const prefixLog = "[updateRolePermissionsUseCase]:"

const FALLBACK_INFRA_ERROR = {
	success: false,
	code: "infra_error",
	message: MSG_INFRA_ERROR
} as const

const isRoleName = (roleName: string, targetRoleName: string) => roleName.trim().toUpperCase() === targetRoleName

const normalizePermissionKeys = (value: unknown) => {
	if (!Array.isArray(value)) {
		return [] as string[]
	}

	return [
		...new Set(
			value
				.filter((item): item is string => typeof item === "string")
				.map((item) => item.trim())
				.filter((item) => item.length > 0)
		)
	]
}

export async function updateRolePermissionsUseCase(params: UpdateRolePermissionsUseCaseParams): OperationResponse<{ roleId: string; addedCount: number; removedCount: number }, ErrorCodes> {
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
		// 2) Verificar permissão de edição de cargos (roles.update)
		//
		// Possibilidades:
		// - erro técnico => infra_error
		// - sem permissão => forbidden
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
				code: "forbidden",
				message: MSG_FORBIDDEN
			}
		}

		// ============================================================
		// 3) Validar cargo informado na organização atual
		//
		// Possibilidades:
		// - erro técnico => infra_error
		// - role não encontrada/inativa => role_not_found
		// - role OWNER => role_not_editable
		// - role válida => seguir fluxo
		// ============================================================
		const rolesRes = await listRolesByOrganizationIdService({ organizationId })
		if (rolesRes.success === false) {
			return FALLBACK_INFRA_ERROR
		}

		const selectedRole = rolesRes.data.roles.find((role) => role.id === params.roleId)
		if (!selectedRole) {
			return {
				success: false,
				code: "role_not_found",
				message: MSG_ROLE_NOT_FOUND
			}
		}

		if (isRoleName(selectedRole.name, "OWNER")) {
			return {
				success: false,
				code: "role_not_editable",
				message: MSG_ROLE_NOT_EDITABLE
			}
		}

		// ============================================================
		// 4) Reforçar regra de edição do cargo ADMIN
		//
		// Regras:
		// - ADMIN só pode ser editado por quem é OWNER
		// - regra é server-side (autoridade final)
		// ============================================================
		if (isRoleName(selectedRole.name, "ADMIN")) {
			const currentMembershipRes = await getMembershipByOrgAndUserIdWithRoleService({
				organizationId,
				userId: currentUserId
			})

			if (currentMembershipRes.success === false) {
				if (currentMembershipRes.code === "membership_not_found") {
					return {
						success: false,
						code: "forbidden",
						message: MSG_FORBIDDEN
					}
				}

				return FALLBACK_INFRA_ERROR
			}

			if (!isRoleName(currentMembershipRes.data.roleName, "OWNER")) {
				return {
					success: false,
					code: "forbidden",
					message: MSG_FORBIDDEN_ADMIN_ROLE
				}
			}
		}

		// ============================================================
		// 5) Normalizar payload de permissionKeys
		//
		// Regras:
		// - trim + dedupe
		// - permite payload vazio (remover todas permissões)
		// - role não OWNER não pode conter sufixo .privileged
		// ============================================================
		const normalizedPermissionKeys = normalizePermissionKeys(params.permissionKeys)

		if (normalizedPermissionKeys.some((permissionKey) => permissionKey.endsWith(".privileged"))) {
			return {
				success: false,
				code: "privileged_permission_not_allowed",
				message: MSG_PRIVILEGED_NOT_ALLOWED
			}
		}

		// ============================================================
		// 6) Validar catálogo de permissões e mapear keys -> ids
		//
		// Possibilidades:
		// - erro técnico => infra_error
		// - key inválida => invalid_permissions
		// - válido => seguir fluxo
		// ============================================================
		const permissionsRes = await listPermissionsService()
		if (permissionsRes.success === false) {
			return FALLBACK_INFRA_ERROR
		}

		const validPermissionKeys = new Set(permissionsRes.data.permissions.map((permission) => permission.key))
		const invalidPermissionKeys = normalizedPermissionKeys.filter((permissionKey) => !validPermissionKeys.has(permissionKey))

		if (invalidPermissionKeys.length > 0) {
			return {
				success: false,
				code: "invalid_permissions",
				message: MSG_INVALID_PERMISSIONS
			}
		}

		const targetPermissionKeys = normalizedPermissionKeys

		// ============================================================
		// 7) Sincronizar role_permissions por diff (insert -> delete)
		//
		// Possibilidades:
		// - erro técnico => infra_error
		// - sucesso => ok
		// ============================================================
		const syncRes = await syncRolePermissionsService({
			roleId: selectedRole.id,
			targetPermissionKeys
		})

		if (syncRes.success === false) {
			return FALLBACK_INFRA_ERROR
		}

		// ============================================================
		// OK: permissões do cargo atualizadas
		// ============================================================
		return {
			success: true,
			message: `Permissões do cargo atualizadas com sucesso. ${syncRes.data.addedCount} adicionadas e ${syncRes.data.removedCount} removidas.`,
			data: {
				roleId: selectedRole.id,
				addedCount: syncRes.data.addedCount,
				removedCount: syncRes.data.removedCount
			}
		}
	} catch (error) {
		console.error(`${prefixLog} unexpected error:`, error)
		return FALLBACK_INFRA_ERROR
	}
}

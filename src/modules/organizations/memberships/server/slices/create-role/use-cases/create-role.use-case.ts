import { getCurrentAuthUserService } from "@/modules/auth/server/services/get-current-auth-user.service"
import { hasMembershipPermissionService } from "@/modules/auth/server/services/has-membership-permission.service"
import { listPermissionsService } from "@/modules/auth/server/services/list-permissions.service"
import { PERMISSIONS } from "@/modules/auth/shared/permissions"
import { createRoleService } from "@/modules/organizations/memberships/server/services/create-role.service"
import { deleteRoleByIdAndOrganizationIdService } from "@/modules/organizations/memberships/server/services/delete-role-by-id-and-organization-id.service"
import { syncRolePermissionsService } from "@/modules/organizations/memberships/server/services/sync-role-permissions.service"
import { getOrganizationIdByAppDomainService } from "@/modules/organizations/server/services/get-organization-id-by-app-domain.service"
import { getRequestHost } from "@/shared/http/get-request-host"
import type { OperationResponse } from "@/shared/types/operation-reponse.types"

type CreateRoleUseCaseParams = {
	name: string
	permissionKeys: string[]
}

type ErrorCodes = "unauthenticated" | "org_not_found" | "forbidden" | "invalid_role_name" | "role_name_conflict" | "invalid_permissions" | "infra_error"

const prefixLog = "[createRoleUseCase]:"

const MSG_ORG_NOT_FOUND = "Não foi possível identificar a organização deste domínio."
const MSG_UNAUTHENTICATED = "Você precisa estar autenticado para continuar."
const MSG_FORBIDDEN = "Você não tem permissão para criar cargos na organização."
const MSG_INVALID_ROLE_NAME = "Informe um nome de cargo entre 3 e 80 caracteres."
const MSG_ROLE_NAME_CONFLICT = "Já existe um cargo com este nome na organização."
const MSG_INVALID_PERMISSIONS = "A solicitação contém permissões inválidas para este ambiente."
const MSG_INFRA_ERROR = "Não foi possível criar o cargo. Tente novamente em instantes."

const FALLBACK_INFRA_ERROR = {
	success: false,
	message: MSG_INFRA_ERROR,
	code: "infra_error"
} as const

const PRIVILEGED_PERMISSION_SUFFIX = ".privileged"

function normalizeRoleName(value: unknown) {
	if (typeof value !== "string") {
		return ""
	}

	return value.trim()
}

function normalizePermissionKeys(value: unknown) {
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

const isValidRoleName = (value: string) => value.length >= 3 && value.length <= 80

export async function createRoleUseCase(params: CreateRoleUseCaseParams): OperationResponse<{ roleId: string; roleName: string; grantedPermissionsCount: number }, ErrorCodes> {
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
		// 2) Verificar permissão para criar cargos (roles.update)
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
		// 3) Validar dados básicos do payload
		//
		// Regras:
		// - name com trim e tamanho entre 3 e 80
		// - permissionKeys: trim + dedupe + sem itens vazios
		// - permission keys com sufixo .privileged são removidas
		// ============================================================
		const normalizedRoleName = normalizeRoleName(params.name)
		if (!isValidRoleName(normalizedRoleName)) {
			return {
				success: false,
				code: "invalid_role_name",
				message: MSG_INVALID_ROLE_NAME
			}
		}

		const normalizedPermissionKeys = normalizePermissionKeys(params.permissionKeys)
		const filteredPermissionKeys = normalizedPermissionKeys.filter((permissionKey) => !permissionKey.endsWith(PRIVILEGED_PERMISSION_SUFFIX))

		// ============================================================
		// 4) Validar catálogo real de permissões
		//
		// Possibilidades:
		// - erro técnico => infra_error
		// - key inválida => invalid_permissions
		// - válido => seguir fluxo
		// ============================================================
		const permissionsCatalogRes = await listPermissionsService()
		if (permissionsCatalogRes.success === false) {
			return FALLBACK_INFRA_ERROR
		}

		const permissionIdByKey = new Map(permissionsCatalogRes.data.permissions.map((permission) => [permission.key, permission.id]))
		const invalidPermissionKeys = filteredPermissionKeys.filter((permissionKey) => !permissionIdByKey.has(permissionKey))

		if (invalidPermissionKeys.length > 0) {
			return {
				success: false,
				code: "invalid_permissions",
				message: MSG_INVALID_PERMISSIONS
			}
		}

		const targetPermissionIds = filteredPermissionKeys.map((permissionKey) => permissionIdByKey.get(permissionKey)).filter((permissionId): permissionId is string => Boolean(permissionId))

		// ============================================================
		// 5) Criar cargo na organização atual
		//
		// Possibilidades:
		// - nome já existente => role_name_conflict
		// - erro técnico => infra_error
		// - sucesso => cargo criado
		// ============================================================
		const createRoleRes = await createRoleService({
			organizationId,
			name: normalizedRoleName,
			isSystem: false,
			isActive: true
		})

		if (createRoleRes.success === false) {
			if (createRoleRes.code === "role_name_conflict") {
				return {
					success: false,
					code: "role_name_conflict",
					message: MSG_ROLE_NAME_CONFLICT
				}
			}

			return FALLBACK_INFRA_ERROR
		}

		const createdRole = createRoleRes.data.role

		// ============================================================
		// 6) Vincular permissões ao cargo recém-criado
		//
		// Regras:
		// - se não houver permissões, manter role sem vínculos
		// - se houver falha na sincronização, executar rollback best-effort
		// ============================================================
		if (targetPermissionIds.length > 0) {
			const syncRes = await syncRolePermissionsService({
				roleId: createdRole.id,
				targetPermissionIds
			})

			if (syncRes.success === false) {
				const rollbackRes = await deleteRoleByIdAndOrganizationIdService({
					roleId: createdRole.id,
					organizationId
				})

				if (rollbackRes.success === false) {
					console.error(`${prefixLog} rollback failed after permission sync error for roleId=${createdRole.id}`)
				}

				return FALLBACK_INFRA_ERROR
			}
		}

		// ============================================================
		// OK: cargo criado e permissões sincronizadas
		// ============================================================
		return {
			success: true,
			message: "Cargo criado com sucesso.",
			data: {
				roleId: createdRole.id,
				roleName: createdRole.name,
				grantedPermissionsCount: targetPermissionIds.length
			}
		}
	} catch (error) {
		console.error(`${prefixLog} unexpected error:`, error)
		return FALLBACK_INFRA_ERROR
	}
}

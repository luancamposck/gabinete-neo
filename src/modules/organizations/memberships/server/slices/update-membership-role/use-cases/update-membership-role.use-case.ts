// @/modules/organizations/memberships/server/slices/update-membership-role/use-cases/update-membership-role.use-case.ts

import { getCurrentAuthUserService } from "@/modules/auth/server/services/get-current-auth-user.service"
import { hasMembershipPermissionService } from "@/modules/auth/server/services/has-membership-permission.service"
import { PERMISSIONS } from "@/modules/auth/shared/permissions"
import { getMembershipByOrgAndUserIdWithRoleService } from "@/modules/organizations/memberships/server/services/get-membership-by-org-and-user-id-with-role.service"
import { listRolesByOrganizationIdService } from "@/modules/organizations/memberships/server/services/list-roles-by-organization-id.service"
import { updateMembershipByOrgAndUserIdService } from "@/modules/organizations/memberships/server/services/update-membership-by-org-and-user-id.service"
import { getOrganizationIdByAppDomainService } from "@/modules/organizations/server/services/get-organization-id-by-app-domain.service"
import { getRequestHost } from "@/shared/http/get-request-host"
import type { OperationResponse } from "@/shared/types/operation-response.types"

type UpdateMembershipRoleUseCaseParams = {
	memberUserId: string
	roleId: string
}

type ErrorCodes = "unauthenticated" | "org_not_found" | "forbidden" | "invalid_role" | "membership_not_found" | "infra_error"

const MSG_ORG_NOT_FOUND = "Não foi possível identificar a organização deste domínio."
const MSG_UNAUTHENTICATED = "Você precisa estar autenticado para continuar."
const MSG_FORBIDDEN = "Você não tem permissão para alterar cargo de membro."
const MSG_FORBIDDEN_PRIVILEGED = "Você não tem permissão para alterar cargos privilegiados (Owner/Admin)."
const MSG_INVALID_ROLE = "O cargo selecionado não é válido para esta organização."
const MSG_INFRA_ERROR = "Não foi possível atualizar o cargo. Tente novamente em instantes."

const FALLBACK_INFRA_ERROR = {
	success: false,
	code: "infra_error",
	message: MSG_INFRA_ERROR
} as const

const PRIVILEGED_ROLE_NAMES = new Set(["OWNER", "ADMIN"])

export async function updateMembershipRoleUseCase(params: UpdateMembershipRoleUseCaseParams): OperationResponse<{ memberUserId: string; roleId: string }, ErrorCodes> {
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

		const { id: currentUserId } = authRes.data.user

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
		// 2) Verificar permissão para alterar cargo de membro
		//
		// Possibilidades:
		// - erro técnico => infra_error
		// - sem permissão => forbidden
		// - com permissão => ok
		// ============================================================
		const permissionRes = await hasMembershipPermissionService({
			organizationId,
			userId: currentUserId,
			permissionKey: PERMISSIONS.ORG_MEMBERSHIP_ROLE_UPDATE
		})
		if (permissionRes.success === false || !permissionRes.data) {
			return FALLBACK_INFRA_ERROR
		}

		const { allowed } = permissionRes.data

		if (allowed === false) {
			return {
				success: false,
				code: "forbidden",
				message: MSG_FORBIDDEN
			}
		}

		// ============================================================
		// 3) Validar se a role selecionada é válida na organização
		//
		// Possibilidades:
		// - erro técnico ao carregar roles => infra_error
		// - role inexistente/inválida => invalid_role
		// - role válida => ok
		// ============================================================
		const rolesRes = await listRolesByOrganizationIdService({ organizationId })
		if (rolesRes.success === false || !rolesRes.data) {
			return FALLBACK_INFRA_ERROR
		}

		const selectedRole = rolesRes.data.roles.find((role) => role.id === params.roleId)
		if (!selectedRole) {
			return {
				success: false,
				code: "invalid_role",
				message: MSG_INVALID_ROLE
			}
		}

		// ============================================================
		// 4) Validar regras de cargos privilegiados (Owner/Admin)
		//
		// Regras:
		// - se cargo atual OU destino for privilegiado, exige permissão
		//   org.membership.role.update.privileged
		// ============================================================
		const membershipRes = await getMembershipByOrgAndUserIdWithRoleService({
			organizationId,
			userId: params.memberUserId
		})
		if (membershipRes.success === false) {
			if (membershipRes.code === "membership_not_found") {
				return {
					success: false,
					code: "membership_not_found",
					message: membershipRes.message
				}
			}

			return FALLBACK_INFRA_ERROR
		}

		const isPrivilegedCurrent = PRIVILEGED_ROLE_NAMES.has(membershipRes.data.roleName.toUpperCase())
		const isPrivilegedTarget = PRIVILEGED_ROLE_NAMES.has(selectedRole.name.toUpperCase())

		if (isPrivilegedCurrent || isPrivilegedTarget) {
			const privilegedPermissionRes = await hasMembershipPermissionService({
				organizationId,
				userId: currentUserId,
				permissionKey: PERMISSIONS.ORG_MEMBERSHIP_ROLE_UPDATE_PRIVILEGED
			})

			if (privilegedPermissionRes.success === false || !privilegedPermissionRes.data) {
				return FALLBACK_INFRA_ERROR
			}

			if (!privilegedPermissionRes.data.allowed) {
				return {
					success: false,
					code: "forbidden",
					message: MSG_FORBIDDEN_PRIVILEGED
				}
			}
		}

		// ============================================================
		// 5) Atualizar membership (patch: roleId)
		//
		// Possibilidades:
		// - membership não encontrada => membership_not_found
		// - erro técnico => infra_error
		// - sucesso => ok
		// ============================================================
		const updateRes = await updateMembershipByOrgAndUserIdService({
			organizationId,
			userId: params.memberUserId,
			patch: {
				roleId: params.roleId
			}
		})

		if (updateRes.success === false) {
			if (updateRes.code === "membership_not_found") {
				return {
					success: false,
					code: "membership_not_found",
					message: updateRes.message
				}
			}

			return FALLBACK_INFRA_ERROR
		}

		// ============================================================
		// OK: cargo atualizado com sucesso
		// ============================================================
		return {
			success: true,
			message: "Cargo do membro atualizado com sucesso.",
			data: {
				memberUserId: params.memberUserId,
				roleId: params.roleId
			}
		}
	} catch {
		return {
			success: false,
			code: "infra_error",
			message: MSG_INFRA_ERROR
		}
	}
}

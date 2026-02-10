// @/modules/organizations/memberships/server/slices/update-membership-status/use-cases/update-membership-status.use-case.ts

import { getCurrentAuthUserService } from "@/modules/auth/server/services/get-current-auth-user.service"
import { hasMembershipPermissionService } from "@/modules/auth/server/services/has-membership-permission.service"
import { PERMISSIONS } from "@/modules/auth/shared/permissions"
import { getMembershipByOrgAndUserIdWithRoleService } from "@/modules/organizations/memberships/server/services/get-membership-by-org-and-user-id-with-role.service"
import { updateMembershipByOrgAndUserIdService } from "@/modules/organizations/memberships/server/services/update-membership-by-org-and-user-id.service"
import { getOrganizationIdByAppDomainService } from "@/modules/organizations/server/services/get-organization-id-by-app-domain.service"
import { getRequestHost } from "@/shared/http/get-request-host"
import type { OperationResponse } from "@/shared/types/operation-reponse.types"

type UpdateMembershipStatusUseCaseParams = {
	memberUserId: string
	isActive: boolean
}

type ErrorCodes = "unauthenticated" | "org_not_found" | "forbidden" | "membership_not_found" | "cannot_deactivate_self" | "infra_error"

const MSG_ORG_NOT_FOUND = "Não foi possível identificar a organização deste domínio."
const MSG_UNAUTHENTICATED = "Você precisa estar autenticado para continuar."
const MSG_FORBIDDEN = "Você não tem permissão para alterar o status do membro."
const MSG_FORBIDDEN_PRIVILEGED_TARGET = "Você não tem permissão para alterar o status de membros privilegiados (Owner/Admin)."
const MSG_INFRA_ERROR = "Não foi possível atualizar o status do membro. Tente novamente em instantes."
const MSG_CANNOT_DEACTIVATE_SELF = "Você não pode inativar você mesmo por aqui."

const FALLBACK_INFRA_ERROR = {
	success: false,
	code: "infra_error",
	message: MSG_INFRA_ERROR
} as const

export async function updateMembershipStatusUseCase(params: UpdateMembershipStatusUseCaseParams): OperationResponse<{ memberUserId: string; isActive: boolean }, ErrorCodes> {
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
		const currentUserId = authRes.data.user.id

		// ============================================================
		// 2) Verificar permissões para alterar status de membership
		//
		// Possibilidades:
		// - erro técnico => infra_error
		// - sem nenhuma permissão => forbidden
		// - com permissão base/privilegiada => ok
		// ============================================================
		const basePermissionRes = await hasMembershipPermissionService({
			organizationId,
			userId: currentUserId,
			permissionKey: PERMISSIONS.ORG_MEMBERSHIP_STATUS_UPDATE
		})
		if (basePermissionRes.success === false) {
			return FALLBACK_INFRA_ERROR
		}

		const privilegedPermissionRes = await hasMembershipPermissionService({
			organizationId,
			userId: currentUserId,
			permissionKey: PERMISSIONS.ORG_MEMBERSHIP_STATUS_UPDATE_PRIVILEGED
		})
		if (privilegedPermissionRes.success === false) {
			return FALLBACK_INFRA_ERROR
		}

		const hasBaseStatusPermission = basePermissionRes.data.allowed
		const hasPrivilegedStatusPermission = privilegedPermissionRes.data.allowed
		const hasAnyStatusPermission = hasBaseStatusPermission || hasPrivilegedStatusPermission

		if (!hasAnyStatusPermission) {
			return {
				success: false,
				code: "forbidden",
				message: MSG_FORBIDDEN
			}
		}

		// ============================================================
		// 3) Carregar membership alvo e role para validações de regra
		//
		// Possibilidades:
		// - membership não encontrada => membership_not_found
		// - erro técnico => infra_error
		// - membership encontrada => ok
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

		// ============================================================
		// 4) Aplicar regras de segurança de status
		//
		// Regras:
		// - OWNER/ADMIN só pode com permissão status.update.privileged
		// - não pode inativar a si mesmo
		// ============================================================
		const targetRoleName = membershipRes.data.roleName.toUpperCase()
		const isPrivilegedTargetRole = targetRoleName === "OWNER" || targetRoleName === "ADMIN"

		if (isPrivilegedTargetRole && !hasPrivilegedStatusPermission) {
			return {
				success: false,
				code: "forbidden",
				message: MSG_FORBIDDEN_PRIVILEGED_TARGET
			}
		}

		if (params.isActive === false && params.memberUserId === currentUserId) {
			return {
				success: false,
				code: "cannot_deactivate_self",
				message: MSG_CANNOT_DEACTIVATE_SELF
			}
		}

		// ============================================================
		// 5) Atualizar membership (patch: isActive)
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
				isActive: params.isActive
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
		// OK: status atualizado com sucesso (ativação/inativação)
		// ============================================================
		return {
			success: true,
			message: params.isActive ? "Membro ativado com sucesso." : "Membro inativado com sucesso.",
			data: {
				memberUserId: params.memberUserId,
				isActive: params.isActive
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

// @/modules/organizations/memberships/server/slices/get-organization-members-for-table/use-cases/get-organization-members-for-table.use-case.ts

import { getCurrentAuthUserService } from "@/modules/auth/server/services/get-current-auth-user.service"
import { listMembershipPermissionsService } from "@/modules/auth/server/services/list-membership-permissions.service"
import type { PermissionKey } from "@/modules/auth/shared/permissions"
import type { OrganizationMemberWithUserProfileAndRole } from "@/modules/organizations/memberships/server/repos/list-organization-members-with-profile-and-role-by-organization-id.repo"
import { listOrganizationMembersWithProfileAndRoleByOrganizationIdService } from "@/modules/organizations/memberships/server/services/list-organization-members-with-profile-and-role-by-organization-id.service"
import { listRolesByOrganizationIdService } from "@/modules/organizations/memberships/server/services/list-roles-by-organization-id.service"
import type { RoleView } from "@/modules/organizations/memberships/shared/types/views"
import type { OrganizationReferralWithInviterName } from "@/modules/organizations/referrals/server/repos/list-referrals-with-inviter-by-organization-id.admin.repo"
import { listReferralsWithInviterByOrganizationIdService } from "@/modules/organizations/referrals/server/services/list-referrals-with-inviter-by-organization-id.service"
import { getOrganizationIdByAppDomainAction } from "@/modules/organizations/server/slices/get-organization-id-by-app-domain/actions/get-organization-id-by-app-domain.action"
import { getRequestHost } from "@/shared/http/get-request-host"
import type { OperationResponse } from "@/shared/types/operation-reponse.types"

type GetOrganizationMembersForTableUseCaseRes = {
	permissionsKeys: PermissionKey[]
	roles: RoleView[]
	organizationMembers: OrganizationMemberWithUserProfileAndRole[]
	organizationReferrals: OrganizationReferralWithInviterName[]
}

type ErrorCodes = "unauthenticated" | "org_not_found" | "infra_error"

const prefixLog = "[getOrganizationMembersForTableUseCase]:"

const MSG_ORG_NOT_FOUND = "Não foi possível identificar a organização deste domínio."
const MSG_UNAUTHENTICATED = "Você precisa estar autenticado para continuar."
const MSG_INFRA_ERROR = "Não foi possível preparar os dados. Tente novamente em instantes."

const FALLBACK_INFRA_ERROR = {
	success: false,
	message: MSG_INFRA_ERROR,
	code: "infra_error"
} as const

export async function getOrganizationMembersForTableUseCase(): OperationResponse<GetOrganizationMembersForTableUseCaseRes, ErrorCodes> {
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
				return {
					success: false,
					code: "infra_error",
					message: MSG_INFRA_ERROR
				}
			}

			return FALLBACK_INFRA_ERROR
		}

		const currentUserId = authRes.data.user.id

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
		const orgRes = await getOrganizationIdByAppDomainAction({ appDomain: host })
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
		// 3) Carregar permissões atuais do usuário na organização
		//
		// Possibilidades:
		// - erro técnico => infra_error
		// - ok => lista de permission keys (pode vir vazia)
		// ============================================================
		const permissionRes = await listMembershipPermissionsService({
			organizationId,
			userId: currentUserId
		})
		if (permissionRes.success === false) {
			console.error(`${prefixLog} permission load failed:`, permissionRes.message)
			return FALLBACK_INFRA_ERROR
		}

		const { permissionKeys: permissionsKeys } = permissionRes.data

		// ============================================================
		// 3.5) Carregar roles, apenas se o usuário tiver permissão de gerenciar membros (para popular opções de role na edição de membro)
		//
		// Possibilidades:
		// - erro técnico => infra_error
		// - ok => lista de permission keys (pode vir vazia)
		// ============================================================
		const canUpdateRole = permissionsKeys.includes("org.membership.role.update")
		const canUpdateRolePrivileged = permissionsKeys.includes("org.membership.role.update.privileged")

		let roles: RoleView[] = []
		if (canUpdateRole || canUpdateRolePrivileged) {
			const rolesRes = await listRolesByOrganizationIdService({ organizationId })
			if (rolesRes.success === false || !rolesRes.data) {
				console.error(`${prefixLog} roles load failed:`, rolesRes.message)
				return FALLBACK_INFRA_ERROR
			}

			roles = rolesRes.data.roles
		}

		// ============================================================
		// 4) Carregar membros da organização com profile + role
		//
		// Possibilidades:
		// - erro técnico => infra_error
		// - ok => members list (já filtrada por profile)
		// ============================================================
		const membersRes = await listOrganizationMembersWithProfileAndRoleByOrganizationIdService({ organizationId })
		if (membersRes.success === false) {
			console.error(`${prefixLog} members load failed:`, membersRes.message)
			return FALLBACK_INFRA_ERROR
		}

		const organizationMembers = membersRes.data.organizationMembers ?? []

		// ============================================================
		// 5) Listar referrals da organização (quem convidou quem + parentesco)
		//
		// Possibilidades:
		// - erro técnico => infra_error
		// - sucesso => referrals para enriquecer o contexto da tabela
		// ============================================================
		const referralsRes = await listReferralsWithInviterByOrganizationIdService({ organizationId })
		if (referralsRes.success === false) {
			console.error(`${prefixLog} referrals load failed:`, referralsRes.message)
			return FALLBACK_INFRA_ERROR
		}

		// ============================================================
		// OK: dados prontos para data-table
		// ============================================================
		return {
			success: true,
			message: membersRes.message,
			data: {
				permissionsKeys,
				roles,
				organizationMembers,
				organizationReferrals: referralsRes.data.organizationReferrals ?? []
			}
		}
	} catch (error) {
		console.error(`${prefixLog} unexpected error:`, error)
		return FALLBACK_INFRA_ERROR
	}
}

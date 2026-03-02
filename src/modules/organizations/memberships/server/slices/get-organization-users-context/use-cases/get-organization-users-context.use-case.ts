import { getCurrentAuthUserService } from "@/modules/auth/server/services/get-current-auth-user.service"
import { hasMembershipPermissionService } from "@/modules/auth/server/services/has-membership-permission.service"
import { listMembershipPermissionsService } from "@/modules/auth/server/services/list-membership-permissions.service"
import { PERMISSIONS, type PermissionKey } from "@/modules/auth/shared/permissions"
import type { OrganizationMemberWithUserProfileAndRole } from "@/modules/organizations/memberships/server/repos/list-organization-members-with-profile-and-role-by-organization-id.repo"
import { listOrganizationMembersWithProfileAndRoleByOrganizationIdService } from "@/modules/organizations/memberships/server/services/list-organization-members-with-profile-and-role-by-organization-id.service"
import { listRolesByOrganizationIdService } from "@/modules/organizations/memberships/server/services/list-roles-by-organization-id.service"
import type { RoleView } from "@/modules/organizations/memberships/shared/types/views"
import type { OrganizationReferralWithInviterName } from "@/modules/organizations/referrals/server/repos/list-referrals-with-inviter-by-organization-id.admin.repo"
import { listReferralsWithInviterByOrganizationIdService } from "@/modules/organizations/referrals/server/services/list-referrals-with-inviter-by-organization-id.service"
import { getOrganizationByIdService } from "@/modules/organizations/server/services/get-organization-by-id.service"
import { getOrganizationIdByAppDomainService } from "@/modules/organizations/server/services/get-organization-id-by-app-domain.service"
import { getRequestHost } from "@/shared/http/get-request-host"
import type { OperationResponse } from "@/shared/types/operation-response.types"

type GetOrganizationUsersContextUseCaseRes = {
	organization: {
		name: string
	}
	permissionKeys: PermissionKey[]
	roles: RoleView[]
	organizationMembers: OrganizationMemberWithUserProfileAndRole[]
	organizationReferrals: OrganizationReferralWithInviterName[]
}

type ErrorCodes = "unauthenticated" | "org_not_found" | "not_allowed" | "infra_error"

const prefixLog = "[getOrganizationUsersContextUseCase]:"

const MSG_ORG_NOT_FOUND = "Não foi possível identificar a organização deste domínio."
const MSG_UNAUTHENTICATED = "Você precisa estar autenticado para continuar."
const MSG_NOT_ALLOWED = "Você não tem permissão para visualizar usuários da organização."
const MSG_INFRA_ERROR = "Não foi possível carregar os usuários da organização. Tente novamente em instantes."

const FALLBACK_INFRA_ERROR = {
	success: false,
	message: MSG_INFRA_ERROR,
	code: "infra_error"
} as const

export async function getOrganizationUsersContextUseCase(): OperationResponse<GetOrganizationUsersContextUseCaseRes, ErrorCodes> {
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

		const organizationId = orgRes.data.organizationId

		// ============================================================
		// 2) Verificar permissão para visualizar usuários (users.read)
		//
		// Possibilidades:
		// - erro técnico => infra_error
		// - sem permissão => not_allowed
		// - com permissão => seguir fluxo
		// ============================================================
		const permissionRes = await hasMembershipPermissionService({
			organizationId,
			userId: currentUserId,
			permissionKey: PERMISSIONS.USERS_READ
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
		// 2.5) Carregar permissões do usuário no tenant
		//
		// Possibilidades:
		// - erro técnico => infra_error
		// - sucesso => permission keys para UI habilitar ações
		// ============================================================
		const membershipPermissionsRes = await listMembershipPermissionsService({
			organizationId,
			userId: currentUserId
		})
		if (membershipPermissionsRes.success === false) {
			return FALLBACK_INFRA_ERROR
		}
		const permissionKeys = membershipPermissionsRes.data.permissionKeys

		// ============================================================
		// 2.6) Carregar roles apenas se houver permissão de troca de cargo
		//
		// Possibilidades:
		// - erro técnico => infra_error
		// - sem permissão => roles vazias
		// - com permissão => lista de roles ativas da organização
		// ============================================================
		const canUpdateRole = permissionKeys.includes(PERMISSIONS.ORG_MEMBERSHIP_ROLE_UPDATE)
		const canUpdateRolePrivileged = permissionKeys.includes(PERMISSIONS.ORG_MEMBERSHIP_ROLE_UPDATE_PRIVILEGED)

		let roles: RoleView[] = []
		if (canUpdateRole || canUpdateRolePrivileged) {
			const rolesRes = await listRolesByOrganizationIdService({ organizationId })
			if (rolesRes.success === false) {
				console.error(`${prefixLog} roles load failed:`, rolesRes.message)
				return FALLBACK_INFRA_ERROR
			}

			roles = rolesRes.data.roles ?? []
		}

		// ============================================================
		// 3) Carregar organização alvo
		//
		// Possibilidades:
		// - org não encontrada => org_not_found
		// - erro técnico => infra_error
		// - sucesso => dados da organização
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
		// 4) Listar members da organização com user/profile/role
		//
		// Possibilidades:
		// - erro técnico => infra_error
		// - sucesso => members para o contexto da página
		// ============================================================
		const membersRes = await listOrganizationMembersWithProfileAndRoleByOrganizationIdService({ organizationId })
		if (membersRes.success === false) {
			console.error(`${prefixLog} members load failed:`, membersRes.message)
			return FALLBACK_INFRA_ERROR
		}

		// ============================================================
		// 5) Listar referrals da organização (quem convidou quem + parentesco)
		//
		// Possibilidades:
		// - erro técnico => infra_error
		// - sucesso => referrals para enriquecer o contexto de usuários
		// ============================================================
		const referralsRes = await listReferralsWithInviterByOrganizationIdService({ organizationId })
		if (referralsRes.success === false) {
			console.error(`${prefixLog} referrals load failed:`, referralsRes.message)
			return FALLBACK_INFRA_ERROR
		}

		// ============================================================
		// OK: contexto de usuários carregado
		// ============================================================
		return {
			success: true,
			message: "Contexto de usuários carregado com sucesso.",
			data: {
				organization: {
					name: organizationRes.data.organization.name
				},
				permissionKeys,
				roles,
				organizationMembers: membersRes.data.organizationMembers ?? [],
				organizationReferrals: referralsRes.data.organizationReferrals ?? []
			}
		}
	} catch (error) {
		console.error(`${prefixLog} unexpected error:`, error)
		return FALLBACK_INFRA_ERROR
	}
}

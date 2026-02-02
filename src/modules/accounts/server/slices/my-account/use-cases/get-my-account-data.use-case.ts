import { getUserWithProfileService } from "@/modules/accounts/users/server/services/get-user-with-profile.service"
import type { UserWithProfileView } from "@/modules/accounts/users/shared/types/views"
import { getCurrentAuthUserService } from "@/modules/auth/server/services/get-current-auth-user.service"
import { getOrganizationIdByAppDomainService } from "@/modules/organizations/server/services/get-organization-id-by-app-domain.service"
import { getOrganizationWithMemberhipService } from "@/modules/organizations/server/services/get-organization-with-membership.service"
import type { OrganizationWithMembershipView } from "@/modules/organizations/shared/types/views"
import { getRequestHost } from "@/shared/http/get-request-host"
import type { OperationResponse } from "@/shared/types/operation-reponse.types"

const MSG_ORG_NOT_FOUND = "Não foi possível identificar a organização deste domínio."
const MSG_USER_NOT_FOUND = "Não foi possível identificar seu usuário."
const MSG_UNAUTHENTICATED = "Você precisa estar autenticado para acessar o dashboard."
const MSG_INFRA_ERROR = "Não foi possível validar seu acesso. Tente novamente em instantes."

const FALLBACK_INFRA_ERROR = {
	success: false,
	message: MSG_INFRA_ERROR,
	code: "infra_error"
} as const

type CodeList = "unauthenticated" | "infra_error" | "user_not_found" | "org_not_found"

type GetMyAccountDataUseCaseRes = OperationResponse<
	{
		userWithProfile: UserWithProfileView
		organizationWithMembership: OrganizationWithMembershipView
	},
	CodeList
>

export async function getMyAccountDataUseCase(): GetMyAccountDataUseCaseRes {
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
	// 1) Buscar usuário com perfil (dados do painel)
	//
	// Possibilidades:
	// - user não encontrado => user_not_found
	// - erro técnico => infra_error
	// ============================================================
	const getUserRes = await getUserWithProfileService({ userId })
	if (getUserRes.success === false) {
		if (getUserRes.code === "user_not_found") {
			return {
				success: false,
				code: "user_not_found",
				message: MSG_USER_NOT_FOUND
			}
		}

		if (getUserRes.code === "infra_error") {
			return {
				success: false,
				code: "infra_error",
				message: MSG_INFRA_ERROR
			}
		}
		return FALLBACK_INFRA_ERROR
	}

	const { userWithProfile } = getUserRes.data

	// ============================================================
	// 2) Resolver host + organizationId (tenant atual via app_domain)
	//
	// Possibilidades:
	// - host ausente => org_not_found (não tem como resolver tenant)
	// - org não encontrada / erro => org_not_found | infra_error
	// ============================================================
	const host = await getRequestHost()
	if (!host) {
		return {
			success: false,
			code: "org_not_found",
			message: MSG_ORG_NOT_FOUND
		}
	}

	const getOrgIdRes = await getOrganizationIdByAppDomainService({ appDomain: host })
	if (getOrgIdRes.success === false) {
		if (getOrgIdRes.code === "org_not_found") {
			return {
				success: false,
				code: "org_not_found",
				message: MSG_ORG_NOT_FOUND
			}
		}

		if (getOrgIdRes.code === "infra_error") {
			return {
				success: false,
				code: "infra_error",
				message: MSG_INFRA_ERROR
			}
		}

		return FALLBACK_INFRA_ERROR
	}

	const { organizationId } = getOrgIdRes.data

	// ============================================================
	// 3) Buscar organização com membership do usuário
	//
	// Possibilidades:
	// - org não encontrada => org_not_found
	// - erro técnico => infra_error
	// ============================================================
	const getOrgRes = await getOrganizationWithMemberhipService({ userId, organizationId })

	if (getOrgRes.success === false) {
		if (getOrgRes.code === "org_not_found") {
			return {
				success: false,
				code: "org_not_found",
				message: MSG_ORG_NOT_FOUND
			}
		}

		if (getOrgRes.code === "infra_error") {
			return {
				success: false,
				code: "infra_error",
				message: MSG_INFRA_ERROR
			}
		}

		return FALLBACK_INFRA_ERROR
	}

	const { organizationWithMembership } = getOrgRes.data

	// ============================================================
	// OK: dados carregados para o painel
	// ============================================================
	return {
		success: true,
		message: "Usuário e constelação buscados com sucesso!",
		data: {
			userWithProfile,
			organizationWithMembership
		}
	}
}

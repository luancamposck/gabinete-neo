import { getCurrentAuthUserService } from "@/modules/auth/server/services/get-current-auth-user.service"
import { isUserMemberOfOrganizationService } from "@/modules/organizations/memberships/server/services/is-user-member-of-organization.service"
import type { OrganizationReferralWithInviterName } from "@/modules/organizations/referrals/server/repos/list-referrals-with-inviter-by-organization-id.admin.repo"
import { listReferralsWithInviterByOrganizationIdService } from "@/modules/organizations/referrals/server/services/list-referrals-with-inviter-by-organization-id.service"
import { getOrganizationIdByAppDomainAction } from "@/modules/organizations/server/slices/get-organization-id-by-app-domain/actions/get-organization-id-by-app-domain.action"
import { getRequestHost } from "@/shared/http/get-request-host"
import type { OperationResponse } from "@/shared/types/operation-response.types"

type GetOrganizationReferralsForTableUseCaseRes = {
	organizationId: string
	organizationReferrals: OrganizationReferralWithInviterName[]
}

type ErrorCodes = "unauthenticated" | "org_not_found" | "not_member" | "infra_error"

const prefixLog = "[getOrganizationReferralsForTableUseCase]:"

const MSG_ORG_NOT_FOUND = "Não foi possível identificar a organização deste domínio."
const MSG_UNAUTHENTICATED = "Você precisa estar autenticado para continuar."
const MSG_NOT_MEMBER = "Você não possui acesso à constelação atual."
const MSG_INFRA_ERROR = "Não foi possível preparar os dados. Tente novamente em instantes."

const FALLBACK_INFRA_ERROR = {
	success: false,
	message: MSG_INFRA_ERROR,
	code: "infra_error"
} as const

export async function getOrganizationReferralsForTableUseCase(): OperationResponse<GetOrganizationReferralsForTableUseCaseRes, ErrorCodes> {
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

			return FALLBACK_INFRA_ERROR
		}

		const currentUserId = authRes.data.user.id

		const host = await getRequestHost()
		if (!host) {
			return {
				success: false,
				code: "org_not_found",
				message: MSG_ORG_NOT_FOUND
			}
		}

		const orgRes = await getOrganizationIdByAppDomainAction({ appDomain: host })
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

		const membershipRes = await isUserMemberOfOrganizationService({
			organizationId,
			userId: currentUserId
		})

		if (membershipRes.success === false) {
			console.error(`${prefixLog} membership check failed:`, membershipRes.message)
			return FALLBACK_INFRA_ERROR
		}

		if (membershipRes.data.isMember === false) {
			return {
				success: false,
				code: "not_member",
				message: MSG_NOT_MEMBER
			}
		}

		const referralsRes = await listReferralsWithInviterByOrganizationIdService({
			organizationId
		})

		if (referralsRes.success === false) {
			console.error(`${prefixLog} referrals load failed:`, referralsRes.message)
			return FALLBACK_INFRA_ERROR
		}

		return {
			success: true,
			message: referralsRes.message,
			data: {
				organizationId,
				organizationReferrals: referralsRes.data.organizationReferrals ?? []
			}
		}
	} catch (error) {
		console.error(`${prefixLog} unexpected error:`, error)
		return FALLBACK_INFRA_ERROR
	}
}

// @/modules/organizations/referrals/server/slices/get-my-referral-link/use-cases/get-my-referral-link.use-case.ts

import { getUserInviteCodeByUserIdService } from "@/modules/accounts/users/server/services/get-user-invite-code-by-user-id.service"
import { getCurrentAuthUserService } from "@/modules/auth/server/services/get-current-auth-user.service"
import { isUserMemberOfOrganizationService } from "@/modules/organizations/memberships/server/services/is-user-member-of-organization.service"
import { getOrganizationIdByAppDomainService } from "@/modules/organizations/server/services/get-organization-id-by-app-domain.service"

import { getRequestHost } from "@/shared/http/get-request-host"
import type { OperationResponse } from "@/shared/types/operation-reponse.types"

type GetMyReferralLinkUseCaseRes = {
	organizationId: string
	userId: string
	referralUrl: string
}

const prefixLog = "[getMyReferralLinkUseCase]:"
const GENERIC_ERROR_MESSAGE = "Não foi possível gerar seu link agora. Tente novamente mais tarde."
const NOT_MEMBER_MESSAGE = "Você precisa estar vinculado a esta organização para gerar um link."

export async function getMyReferralLinkUseCase(): OperationResponse<GetMyReferralLinkUseCaseRes> {
	try {
		// 1) Host atual
		const host = await getRequestHost()
		if (!host) {
			return {
				success: false,
				message: "Não foi possível identificar o domínio da requisição."
			}
		}

		// 2) Org atual via app_domain
		const orgRes = await getOrganizationIdByAppDomainService({ appDomain: host })
		if (orgRes.success === false) return orgRes

		const organizationId = orgRes.data.organizationId

		// 3) Usuário logado
		const currentUserRes = await getCurrentAuthUserService()
		if (currentUserRes.success === false) return currentUserRes

		const userId = currentUserRes.data.user.id

		// 4) Validar que o usuário pertence a esta org
		const membershipRes = await isUserMemberOfOrganizationService({
			organizationId,
			userId
		})
		if (membershipRes.success === false) return membershipRes

		if (membershipRes.data.isMember === false) {
			return {
				success: false,
				message: NOT_MEMBER_MESSAGE
			}
		}

		// 5) Obter invite_code e montar URL do referral
		const inviteCodeRes = await getUserInviteCodeByUserIdService({ userId })
		if (inviteCodeRes.success === false) return inviteCodeRes

		const referralUrl = `https://${host}/?ref=${inviteCodeRes.data.inviteCode}`

		return {
			success: true,
			message: "Link gerado com sucesso.",
			data: { organizationId, userId, referralUrl }
		}
	} catch (error) {
		console.error(`${prefixLog} unexpected error:`, error)
		return {
			success: false,
			message: GENERIC_ERROR_MESSAGE
		}
	}
}

// @/modules/accounts/onboarding/server/slices/register-and-join/use-cases/register-and-join.use-case.ts

import type { RegisterAndJoinParams } from "@/modules/accounts/onboarding/shared/types/inputs"
import { createUserProfileService } from "@/modules/accounts/users/profiles/server/services/create-user-profile.service"
import type { CreateUserProfileParams } from "@/modules/accounts/users/profiles/shared/types/inputs"
import { createUserService } from "@/modules/accounts/users/server/services/create-user.service"
import type { CreateUserParams } from "@/modules/accounts/users/shared/types/inputs"
import { deleteAuthUserService } from "@/modules/auth/server/services/delete-auth-user.service"
import { signUpService } from "@/modules/auth/server/services/sign-up.service"
import { createOrganizationMembershipService } from "@/modules/organizations/memberships/server/services/create-membership.service"
import { isUserMemberOfOrganizationService } from "@/modules/organizations/memberships/server/services/is-user-member-of-organization.service"
import { createOrganizationReferralService } from "@/modules/organizations/referrals/server/services/create-referral.service"
import { getOrganizationIdByAppDomainService } from "@/modules/organizations/server/services/get-organization-id-by-app-domain.service"
import { getRequestHost } from "@/shared/http/get-request-host"
import type { OperationResponse } from "@/shared/types/operation-reponse.types"

type RegisterAndJoinUseCaseRes = {
	organizationId: string
	userId: string
}

const prefixLog = "[registerAndJoinUseCase]:"
const INVALID_REF_MESSAGE = "Link de indicação inválido."
const GENERIC_ERROR_MESSAGE = "Erro inesperado ao finalizar o cadastro."

function isUuidLike(value: string) {
	// Checagem simples (você pode trocar por z.string().uuid() se preferir)
	return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

export async function registerAndJoinUseCase(params: RegisterAndJoinParams): Promise<OperationResponse<RegisterAndJoinUseCaseRes>> {
	try {
		// ------------------------------------------------------------
		// 0) Resolver organizationId via host (app_domain)
		// ------------------------------------------------------------
		const host = await getRequestHost()
		if (!host) {
			console.error(`${prefixLog} missing request host`)
			return { success: false, message: "Não foi possível identificar o domínio da requisição." }
		}

		const orgRes = await getOrganizationIdByAppDomainService({ appDomain: host })
		if (orgRes.success === false) return orgRes

		const organizationId = orgRes.data.organizationId

		// ------------------------------------------------------------
		// 0.1) Validar ref (se existir) E garantir que pertence à org
		// ------------------------------------------------------------
		const rawRef = (params.ref ?? "").trim()
		const inviterUserId = rawRef.length > 0 ? rawRef : null

		if (inviterUserId && isUuidLike(inviterUserId) === false) {
			return { success: false, message: INVALID_REF_MESSAGE }
		}

		if (inviterUserId) {
			const inviterMembershipRes = await isUserMemberOfOrganizationService({
				organizationId,
				userId: inviterUserId
			})

			if (inviterMembershipRes.success === false) {
				// falha técnica (repo/service), mantém comportamento padrão
				return inviterMembershipRes
			}

			if (inviterMembershipRes.data.isMember === false) {
				return { success: false, message: INVALID_REF_MESSAGE }
			}
		}

		// ------------------------------------------------------------
		// 1) Criar usuário no Auth
		// ------------------------------------------------------------
		const signUpServiceRes = await signUpService({
			email: params.email,
			password: params.password
		})
		if (signUpServiceRes.success === false) return signUpServiceRes

		const userId = signUpServiceRes.data.userId

		// ------------------------------------------------------------
		// 2) Criar public.users
		// ------------------------------------------------------------
		const createUserServiceParams: CreateUserParams = {
			id: userId,
			email: params.email,
			name: params.name
		}

		const createUserServiceRes = await createUserService(createUserServiceParams)
		if (createUserServiceRes.success === false) {
			await deleteAuthUserService({ userId })
			return createUserServiceRes
		}

		// ------------------------------------------------------------
		// 3) Criar user_profiles
		// ------------------------------------------------------------
		const createUserProfileParams: CreateUserProfileParams = {
			userId,
			phone: params.phone,
			cep: params.cep,
			state: params.state,
			city: params.city,
			neighborhood: params.neighborhood,
			street: params.street,
			number: params.number,
			complement: params.complement
		}

		const createUserProfileServiceRes = await createUserProfileService(createUserProfileParams)
		if (createUserProfileServiceRes.success === false) {
			await deleteAuthUserService({ userId })
			return createUserProfileServiceRes
		}

		// ------------------------------------------------------------
		// 4) Criar membership (role MEMBER) + invited_by_user_id (se houver)
		// ------------------------------------------------------------
		const membershipRes = await createOrganizationMembershipService({
			organizationId,
			userId,
			invitedByUserId: inviterUserId ?? undefined
		})

		if (membershipRes.success === false) {
			await deleteAuthUserService({ userId })
			return membershipRes
		}

		// ------------------------------------------------------------
		// 5) Registrar referral (se houver ref)
		// ------------------------------------------------------------
		if (inviterUserId) {
			const referralRes = await createOrganizationReferralService({
				organizationId,
				inviterUserId,
				invitedUserId: userId,
				relationshipToInviter: params.relationshipToInviter ?? null
			})

			// Aqui eu recomendo não quebrar o cadastro se falhar referral.
			// Mas se você quiser hard-fail, é só tratar como os outros.
			if (referralRes.success === false) {
				console.error(`${prefixLog} referral failed after membership`, referralRes.message)
			}
		}

		return {
			success: true,
			message: "Registro e associação concluídos com sucesso.",
			data: { userId, organizationId }
		}
	} catch (error) {
		console.error(`${prefixLog} unexpected error:`, error)
		return { success: false, message: GENERIC_ERROR_MESSAGE }
	}
}

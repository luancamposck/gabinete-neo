// @/modules/accounts/onboarding/server/slices/register-and-join/use-cases/register-and-join.use-case.ts

import type { RegisterAndJoinParams } from "@/modules/accounts/onboarding/shared/types/inputs"
import { createUserProfileService } from "@/modules/accounts/users/profiles/server/services/create-user-profile.service"
import type { CreateUserProfileParams } from "@/modules/accounts/users/profiles/shared/types/inputs"
import { createUserService } from "@/modules/accounts/users/server/services/create-user.service"
import type { CreateUserParams } from "@/modules/accounts/users/shared/types/inputs"
import { deleteAuthUserService } from "@/modules/auth/server/services/delete-auth-user.service"
import { signUpService } from "@/modules/auth/server/services/sign-up.service"
import { createOrganizationMembershipService } from "@/modules/organizations/memberships/server/services/create-membership.service"
import { getOrganizationIdByAppDomainService } from "@/modules/organizations/server/services/get-organization-id-by-app-domain.service"

import { getRequestHost } from "@/shared/http/get-request-host"
import type { OperationResponse } from "@/shared/types/operation-reponse.types"

type RegisterAndJoinUseCaseRes = {
	organizationId: string
	userId: string
}

const prefixLog = "[registerAndJoinUseCase]:"

export async function registerAndJoinUseCase(params: RegisterAndJoinParams): OperationResponse<RegisterAndJoinUseCaseRes> {
	try {
		// ------------------------------------------------------------
		// 0) Descobrir a organização pelo domínio do app (app_domain)
		// ------------------------------------------------------------
		const host = await getRequestHost()

		if (!host) {
			console.error(`${prefixLog} missing request host`)
			return {
				success: false,
				message: "Não foi possível identificar o domínio da requisição."
			}
		}
		console.log({ host })

		const orgRes = await getOrganizationIdByAppDomainService({ appDomain: host })

		if (orgRes.success === false) return orgRes

		const organizationId = orgRes.data.organizationId

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
			// se você for adotar CASCADE via auth.users -> public.users -> profiles,
			// esse delete já deve limpar tudo automaticamente.
			await deleteAuthUserService({ userId })
			return createUserProfileServiceRes
		}

		// ------------------------------------------------------------
		// 4) Criar membership
		// ------------------------------------------------------------
		const membershipRes = await createOrganizationMembershipService({ organizationId, userId })
		if (membershipRes.success === false) {
			await deleteAuthUserService({ userId })
			return membershipRes
		}

		return {
			success: true,
			message: "Registro e associação concluídos com sucesso.",
			data: {
				userId,
				organizationId
			}
		}
	} catch (error) {
		console.error(`${prefixLog} unexpected error:`, error)
		return {
			success: false,
			message: "Erro inesperado ao finalizar o cadastro."
		}
	}
}

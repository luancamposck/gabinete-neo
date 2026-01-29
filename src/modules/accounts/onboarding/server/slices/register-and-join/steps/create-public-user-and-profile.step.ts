// @/modules/accounts/onboarding/server/slices/register-and-join/steps/create-public-user-and-profile.step.ts

import { createUserProfileService } from "@/modules/accounts/users/profiles/server/services/create-user-profile.service"
import type { CreateUserProfileParams } from "@/modules/accounts/users/profiles/shared/types/inputs"

import { createUserService } from "@/modules/accounts/users/server/services/create-user.service"
import type { CreateUserParams } from "@/modules/accounts/users/shared/types/inputs"

import { deleteAuthUserService } from "@/modules/auth/server/services/delete-auth-user.service"
import type { OperationResponse } from "@/shared/types/operation-reponse.types"

type CreatePublicUserAndProfileStepParams = {
	userId: string
	email: string
	name: string
	username: string

	phone: string
	cep: string
	state: string
	city: string
	neighborhood: string
	street: string
	number: string
	complement?: string
}

const prefixLog = "[createPublicUserAndProfileStep]:"
const GENERIC_ERROR_MESSAGE = "Erro inesperado ao finalizar o cadastro."

export async function createPublicUserAndProfileStep(params: CreatePublicUserAndProfileStepParams): OperationResponse<null> {
	try {
		const userId = params.userId

		// ------------------------------------------------------------
		// 2) Criar public.users
		// ------------------------------------------------------------
		const createUserServiceParams: CreateUserParams = {
			id: userId,
			email: params.email,
			name: params.name,
			username: params.username
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

		return {
			success: true,
			message: "Usuário público e perfil criados com sucesso.",
			data: null
		}
	} catch (error) {
		console.error(`${prefixLog} unexpected error:`, error)
		return {
			success: false,
			message: GENERIC_ERROR_MESSAGE
		}
	}
}

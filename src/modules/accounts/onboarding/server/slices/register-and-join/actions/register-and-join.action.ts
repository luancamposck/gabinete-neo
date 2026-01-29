// @/modules/accounts/onboarding/server/slices/register-and-join/actions/register-and-join.action.ts

"use server"

import { registerAndJoinUseCase } from "@/modules/accounts/onboarding/server/slices/register-and-join/use-cases/register-and-join.use-case"
import type { RegisterAndJoinParams } from "@/modules/accounts/onboarding/shared/types/inputs"
import { registerAndJoinSchemaServer } from "@/modules/accounts/onboarding/shared/validations/register-and-join.schema"
import type { OperationResponse } from "@/shared/types/operation-reponse.types"

const INVALID_INPUT_MESSAGE = "Dados inválidos. Verifique os campos e tente novamente."

type RegisterAndJoinActionRes = {
	organizationId: string
	userId: string
}

export async function registerAndJoinAction(formData: unknown): OperationResponse<RegisterAndJoinActionRes> {
	const parsed = registerAndJoinSchemaServer.safeParse(formData)

	if (parsed.success === false) {
		console.error(parsed.error)

		return {
			success: false,
			message: INVALID_INPUT_MESSAGE
		}
	}

	const registerAndJoinUseCaseResParams: RegisterAndJoinParams = {
		name: parsed.data.name,
		username: parsed.data.username,
		phone: parsed.data.phone,

		email: parsed.data.email,
		password: parsed.data.password,

		cep: parsed.data.address.cep,
		state: parsed.data.address.state,
		city: parsed.data.address.city,
		neighborhood: parsed.data.address.neighborhood,
		street: parsed.data.address.street,
		number: parsed.data.address.number,
		complement: parsed.data.address.complement,

		ref: parsed.data.ref,
		relationshipToInviter: parsed.data.relationshipToInviter
	}
	const registerAndJoinUseCaseRes = await registerAndJoinUseCase(registerAndJoinUseCaseResParams)

	return registerAndJoinUseCaseRes
}

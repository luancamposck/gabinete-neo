// @/modules/accounts/users/profiles/server/slices/edit-user-address/actions/edit-user-address.action.ts

"use server"

import { editUserAddressUseCase } from "@/modules/accounts/users/profiles/server/slices/edit-user-address/use-cases/edit-user-address.use-case"
import { addressSchemaServer } from "@/modules/accounts/users/profiles/shared/validations/address.schema"
import type { OperationResponse } from "@/shared/types/operation-response.types"

const INVALID_INPUT_MESSAGE = "Dados inválidos. Verifique os campos e tente novamente."

type ErrorCodes = "unauthenticated" | "infra_error"

export async function editUserAddressAction(formData: unknown): OperationResponse<{ userId: string }, ErrorCodes> {
	const parsed = addressSchemaServer.safeParse(formData)

	if (parsed.success === false) {
		console.error(parsed.error)
		return {
			success: false,
			message: INVALID_INPUT_MESSAGE
		}
	}

	const editUserAddressUseCaseRes = await editUserAddressUseCase({
		cep: parsed.data.cep,
		state: parsed.data.state,
		city: parsed.data.city,
		neighborhood: parsed.data.neighborhood,
		street: parsed.data.street,
		number: parsed.data.number,
		complement: parsed.data.complement
	})

	return editUserAddressUseCaseRes
}

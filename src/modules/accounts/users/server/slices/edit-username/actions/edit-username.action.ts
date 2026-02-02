// @/modules/accounts/users/server/slices/edit-username/actions/edit-username.action.ts

"use server"

import { z } from "zod"

import { editUsernameUseCase } from "@/modules/accounts/users/server/slices/edit-username/use-cases/edit-username.use-case"
import type { OperationResponse } from "@/shared/types/operation-reponse.types"

const INVALID_INPUT_MESSAGE = "Dados inválidos. Verifique os campos e tente novamente."
const editUsernameSchema = z.object({
	username: z.string().min(2, "Username precisa ter pelo menos 2 caracteres.").max(32, "Username pode ter no maximo 32 caracteres.")
})

type ErrorCodes = "unauthenticated" | "infra_error" | "username_already_exists"

export async function editUsernameAction(formData: unknown): OperationResponse<{ userId: string; username: string }, ErrorCodes> {
	const parsed = editUsernameSchema.safeParse(formData)

	if (parsed.success === false) {
		console.error(parsed.error)
		return {
			success: false,
			message: INVALID_INPUT_MESSAGE
		}
	}

	return editUsernameUseCase({
		username: parsed.data.username
	})
}

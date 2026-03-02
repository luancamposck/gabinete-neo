// @/modules/auth/server/slices/update-password/actions/update-password.action.ts

"use server"

import { z } from "zod"

import { updatePasswordService } from "@/modules/auth/server/services/update-password.service"
import type { OperationResponse } from "@/shared/types/operation-response.types"

const INVALID_INPUT_MESSAGE = "Dados inválidos. Verifique os campos e tente novamente."

const passwordSchema = z.string().min(8, "A senha deve ter no minimo 8 caracteres.")

const updatePasswordSchema = z
	.object({
		password: passwordSchema,
		confirmPassword: passwordSchema
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "As senhas não coincidem.",
		path: ["confirmPassword"]
	})

export async function updatePasswordAction(formData: unknown): OperationResponse<null> {
	const parsed = updatePasswordSchema.safeParse(formData)

	if (parsed.success === false) {
		console.error(parsed.error)
		return {
			success: false,
			message: INVALID_INPUT_MESSAGE
		}
	}

	return updatePasswordService({
		newPassword: parsed.data.password
	})
}

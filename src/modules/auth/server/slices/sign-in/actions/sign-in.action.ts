// @/modules/auth/server/slices/sign-in/actions/sign-in.action.ts
"use server"

import { signInService } from "@/modules/auth/server/services/sign-in.service"
import { signInSchema } from "@/modules/auth/shared/validations/sign-in.schema"
import type { OperationResponse } from "@/shared/types/operation-reponse.types"

const INVALID_INPUT_MESSAGE = "Dados invalidos. Verifique os campos e tente novamente."

export async function signInAction(formData: unknown): OperationResponse<{ userId: string }> {
	const parsed = signInSchema.safeParse(formData)

	if (parsed.success === false) {
		console.error(parsed.error)

		return {
			success: false,
			message: INVALID_INPUT_MESSAGE
		}
	}

	const { email, password } = parsed.data

	const signInRes = await signInService({ email, password })

	return signInRes
}

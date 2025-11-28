"use server"

import { signInSchemaServer } from "@/lib/validations/auth/sign-in/sign-in-schema.server"
import { signInAuthUserService } from "@/services/sign-in-auth-user.service"
import type { OperationResponse } from "@/types/operation-response"

export async function signInAuthUserAction(formData: unknown): Promise<OperationResponse<{ userId: string }>> {
	// 1) Validação
	const dataParsed = signInSchemaServer.safeParse(formData)

	if (!dataParsed.success) {
		console.error(dataParsed.error)

		return {
			success: false,
			message: dataParsed.error.message
		}
	}

	const { email, password } = dataParsed.data

	// 2) Login(Sign In) do usuário
	const signInAuthUserServiceRes = await signInAuthUserService({ email, password })
	if (signInAuthUserServiceRes.success === false) {
		const errorMessage = signInAuthUserServiceRes.message
		return {
			success: false,
			message: errorMessage
		}
	}

	const userId = signInAuthUserServiceRes.data.userId

	return {
		success: true,
		message: "Usuário logado com sucesso.",
		data: {
			userId: userId
		}
	}
}

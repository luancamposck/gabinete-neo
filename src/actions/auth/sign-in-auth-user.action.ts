// src/app/(auth)/sign-in/sig-in-auth.action.ts
"use server"

import { signInSchemaServer } from "@/lib/validations/auth/sign-in/sign-in-schema.server"
import { resolveUserPostSignInDestinationService, signInAuthUserService } from "@/services/auth"
import type { OperationResponse } from "@/types/operation-response"

type SignInActionResponse = OperationResponse<{
	userId: string
	redirectTo: string
}>

export async function signInAuthUserAction(formData: unknown): Promise<SignInActionResponse> {
	// 1) Validação
	const parsed = signInSchemaServer.safeParse(formData)

	if (!parsed.success) {
		console.error(parsed.error)

		return {
			success: false,
			message: parsed.error.message
		}
	}

	const { email, password } = parsed.data

	// 2) Login (Supabase Auth)
	const signInRes = await signInAuthUserService({ email, password })

	if (!signInRes.success || !signInRes.data) {
		return {
			success: false,
			message: signInRes.message ?? "Falha ao autenticar usuário."
		}
	}

	const userId = signInRes.data.userId

	// 3) Resolver destino pós-login
	const destinationRes = await resolveUserPostSignInDestinationService({ userId })

	if (!destinationRes.success || !destinationRes.data) {
		return {
			success: false,
			message: destinationRes.message ?? "Não foi possível determinar o destino pós-login."
		}
	}

	const { redirectTo } = destinationRes.data

	// 4) NÃO usa redirect aqui. Só retorna.
	return {
		success: true,
		message: "Usuário logado com sucesso.",
		data: {
			userId,
			redirectTo
		}
	}
}

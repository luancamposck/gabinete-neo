// src/app/(auth)/sign-in/sig-in-auth.action.ts
"use server"

import { redirect } from "next/navigation"

import { signInSchemaServer } from "@/lib/validations/auth/sign-in/sign-in-schema.server"
import { resolveUserPostSignInDestinationService } from "@/services/resolve-user-post-sign-in-destination.service"
import { signInAuthUserService } from "@/services/sign-in-auth-user.service"
import type { OperationResponse } from "@/types/operation-response"

export async function signInAuthUserAction(formData: unknown): Promise<OperationResponse<{ userId: string }>> {
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

	// 3) Resolver destino pós-login (dashboard / invite-pending / no-organization)
	const destinationRes = await resolveUserPostSignInDestinationService({ userId })

	if (!destinationRes.success || !destinationRes.data) {
		return {
			success: false,
			message: destinationRes.message ?? "Não foi possível determinar o destino pós-login."
		}
	}

	const { redirectTo } = destinationRes.data

	// 4) Redireciona do lado do servidor (fluxo Next oficial)
	redirect(redirectTo)

	// Nunca chega aqui em runtime (redirect lança), mas o TS exige um retorno
	return {
		success: true,
		message: "Usuário logado com sucesso.",
		data: { userId }
	}
}

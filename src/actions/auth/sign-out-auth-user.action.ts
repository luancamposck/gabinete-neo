// src/app/(auth)/sign-out/sig-out-auth.action.ts
"use server"

import { revalidatePath } from "next/cache"
import { signOutAuthUserService } from "@/services/auth"
import type { OperationResponse } from "@/types/operation-response"

export async function signOutAuthUserAction(): Promise<OperationResponse<{ redirectTo: string }>> {
	// 1) Deslogar user
	const signOutRes = await signOutAuthUserService()

	if (signOutRes.success === false) {
		return {
			success: false,
			message: signOutRes.message
		}
	}

	revalidatePath("/", "layout")

	return {
		success: true,
		message: "Usuário deslogado com sucesso!",
		data: {
			redirectTo: "/"
		}
	}
}

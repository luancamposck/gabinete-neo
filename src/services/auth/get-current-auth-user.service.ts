import type { User } from "@supabase/auth-js"

import { getCurrentAuthUserRepo } from "@/repositories/auth-users/auth-users.repo"
import type { OperationResponse } from "@/types/operation-response"

export async function getCurrentAuthUserService(): Promise<OperationResponse<{ user: User }>> {
	try {
		//  1) Tenta pegar a sessão atual do usuário autenticado
		const { data: userData, error: userError } = await getCurrentAuthUserRepo()

		if (userError) {
			console.error(`[getCurrentAuthUserService]: ${userError.message}`)
			return {
				success: false,
				message: "Erro ao obter dados do usuário."
			}
		}

		if (!userData.user) {
			console.error("[getCurrentAuthUserService]: Sem dados do usuário retornados e nenhum erro ativado")
			return {
				success: false,
				message: "Sem dados do usuário obtidos."
			}
		}

		return {
			success: true,
			message: "dados do usuário com sucesso.",
			data: {
				user: userData.user
			}
		}
	} catch (err) {
		console.error("[getCurrentAuthUserService]: Unexpected error", err)

		return {
			success: false,
			message: "Erro inesperado ao obter dados do usuário."
		}
	}
}

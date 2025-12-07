import type { Session } from "@supabase/auth-js"

import { getCurrentAuthSessionRepo } from "@/repositories/auth-users/auth-users.repo"
import type { OperationResponse } from "@/types/operation-response"

export async function getCurrentAuthSessionService(): Promise<OperationResponse<{ session: Session }>> {
	try {
		//  1) Tenta pegar a sessão atual do usuário autenticado
		const { data: sessionData, error: sessionError } = await getCurrentAuthSessionRepo()

		if (sessionError) {
			console.error(`[getCurrentAuthSessionService]: ${sessionError.message}`)
			return {
				success: false,
				message: "Erro ao obter a sessão atual do usuário."
			}
		}

		if (!sessionData.session) {
			console.error("[getCurrentAuthSessionService]: Sem dados de sessão retornados e nenhum erro ativado")
			return {
				success: false,
				message: "Sem dados de sessão obtidos."
			}
		}

		return {
			success: true,
			message: "Sessão atual obtida com sucesso.",
			data: {
				session: sessionData.session
			}
		}
	} catch (err) {
		console.error("[getCurrentAuthSessionService]: Unexpected error", err)

		return {
			success: false,
			message: "Erro inesperado ao obter a sessão atual do usuário."
		}
	}
}

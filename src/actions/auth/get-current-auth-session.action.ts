import type { Session } from "@supabase/auth-js"

import { getCurrentAuthSessionService } from "@/services/auth/get-current-auth-session.service"
import type { OperationResponse } from "@/types/operation-response"

export async function getCurrentAuthSessionAction(): Promise<OperationResponse<{ session: Session }>> {
	const getCurrentAuthSessionServiceRes = await getCurrentAuthSessionService()

	if (getCurrentAuthSessionServiceRes.success === false) {
		return {
			success: false,
			message: getCurrentAuthSessionServiceRes.message
		}
	}

	const { session } = getCurrentAuthSessionServiceRes.data

	return {
		success: true,
		message: "Sessão atual obtida com sucesso.",
		data: {
			session
		}
	}
}

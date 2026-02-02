// @/modules/accounts/users/server/slices/edit-username/use-cases/edit-username.use-case.ts

import { updateUsernameService } from "@/modules/accounts/users/server/services/update-username.service"
import { getCurrentAuthUserService } from "@/modules/auth/server/services/get-current-auth-user.service"
import type { OperationResponse } from "@/shared/types/operation-reponse.types"

type EditUsernameParams = {
	username: string
}

type ErrorCodes = "unauthenticated" | "infra_error" | "username_already_exists"

const MSG_UNAUTHENTICATED = "Voce precisa estar autenticado para atualizar seu username."
const MSG_INFRA_ERROR = "Nao foi possivel atualizar seu username. Tente novamente em instantes."
const prefixLog = "[editUsernameUseCase]:"

const FALLBACK_INFRA_ERROR = {
	success: false,
	message: MSG_INFRA_ERROR,
	code: "infra_error"
} as const

export async function editUsernameUseCase(params: EditUsernameParams): OperationResponse<{ userId: string; username: string }, ErrorCodes> {
	try {
		const currentUserRes = await getCurrentAuthUserService()
		if (currentUserRes.success === false) {
			if (currentUserRes.code === "unauthenticated") {
				return {
					success: false,
					code: "unauthenticated",
					message: MSG_UNAUTHENTICATED
				}
			}

			if (currentUserRes.code === "infra_error") {
				return FALLBACK_INFRA_ERROR
			}

			return FALLBACK_INFRA_ERROR
		}

		const updateRes = await updateUsernameService({
			userId: currentUserRes.data.user.id,
			username: params.username
		})

		if (updateRes.success === false) return updateRes

		return updateRes
	} catch (error) {
		console.error(`${prefixLog} unexpected error:`, error)
		return FALLBACK_INFRA_ERROR
	}
}

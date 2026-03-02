// @/modules/accounts/users/profiles/server/slices/edit-user-address/use-cases/edit-user-address.use-case.ts

import { updateUserAddressService } from "@/modules/accounts/users/profiles/server/services/update-user-address.service"
import type { UpdateUserAddressParams } from "@/modules/accounts/users/profiles/shared/types/inputs"
import { getCurrentAuthUserService } from "@/modules/auth/server/services/get-current-auth-user.service"
import type { OperationResponse } from "@/shared/types/operation-response.types"

type EditUserAddressParams = Omit<UpdateUserAddressParams, "userId">

type ErrorCodes = "unauthenticated" | "infra_error"

const MSG_UNAUTHENTICATED = "Você precisa estar autenticado para atualizar seu enderçoo."
const MSG_INFRA_ERROR = "Não foi possivel atualizar seu endereco. Tente novamente em instantes."
const prefixLog = "[editUserAddressUseCase]:"

const FALLBACK_INFRA_ERROR = {
	success: false,
	message: MSG_INFRA_ERROR,
	code: "infra_error"
} as const

export async function editUserAddressUseCase(params: EditUserAddressParams): OperationResponse<{ userId: string }, ErrorCodes> {
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

		const userId = currentUserRes.data.user.id

		const updateRes = await updateUserAddressService({
			userId,
			...params
		})

		if (updateRes.success === false) {
			return FALLBACK_INFRA_ERROR
		}

		return updateRes
	} catch (error) {
		console.error(`${prefixLog} unexpected error:`, error)
		return FALLBACK_INFRA_ERROR
	}
}

// @/modules/accounts/users/profiles/server/services/update-user-address.service.ts

import { updateUserAddressRepo } from "@/modules/accounts/users/profiles/server/repos/update-address.repo"
import type { UserProfileUpdate } from "@/modules/accounts/users/profiles/shared/types/db"
import type { UpdateUserAddressParams } from "@/modules/accounts/users/profiles/shared/types/inputs"
import type { OperationResponse } from "@/shared/types/operation-response.types"

const GENERIC_UPDATE_ADDRESS_ERROR = "Nao foi possivel atualizar o endereco do usuario. Tente novamente mais tarde."
const UPDATE_ADDRESS_SUCCESS = "Endereco atualizado com sucesso."
const prefixLog = "[updateUserAddressService]:"

export async function updateUserAddressService(params: UpdateUserAddressParams): OperationResponse<{ userId: string }> {
	const { userId, ...address } = params

	const updateUserAddressParams: UserProfileUpdate = {
		cep: address.cep,
		state: address.state,
		city: address.city,
		neighborhood: address.neighborhood,
		street: address.street,
		number: address.number,
		complement: address.complement
	}

	try {
		const { data: updatedProfile, error: updateError } = await updateUserAddressRepo({
			userId,
			address: updateUserAddressParams
		})

		if (updateError) {
			console.error(`${prefixLog} ${updateError.message}`)
			return {
				success: false,
				message: GENERIC_UPDATE_ADDRESS_ERROR
			}
		}

		const updatedUserId = updatedProfile?.user_id
		if (!updatedUserId) {
			console.error(`${prefixLog} missing user id after update`)
			return {
				success: false,
				message: GENERIC_UPDATE_ADDRESS_ERROR
			}
		}

		return {
			success: true,
			message: UPDATE_ADDRESS_SUCCESS,
			data: {
				userId: updatedUserId
			}
		}
	} catch (error) {
		console.error(`${prefixLog} unexpected error:`, error)
		return {
			success: false,
			message: GENERIC_UPDATE_ADDRESS_ERROR
		}
	}
}

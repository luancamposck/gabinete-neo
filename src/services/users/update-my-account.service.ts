// src/services/account/update-my-account.service.ts

import { getUserWithProfileByUserIdRepo, updatePublicUserRepo } from "@/repositories/public-users/public-users.repo"
import { updateUserProfileRepo } from "@/repositories/user-profiles/user-profiles.repo"
import type { UserProfileUpdate } from "@/types/domain/users/user-profile.types"
import type { OperationResponse } from "@/types/operation-response"

export interface UpdateMyAccountServiceParams {
	userId: string

	// campos que vêm da action já normalizados
	name: string
	phone: string
	cep: string
	street: string
	number: string
	complement: string | undefined
	neighborhood: string
	city: string
	state: string
}

export async function updateMyAccountService({ userId, name, phone, cep, street, number, complement, neighborhood, city, state }: UpdateMyAccountServiceParams): Promise<OperationResponse<null>> {
	try {
		// 1) Buscar estado original do usuário para rollback
		const { data: originalUser, error: originalUserError } = await getUserWithProfileByUserIdRepo({ userId })

		if (originalUserError || !originalUser) {
			console.error("[updateMyAccountService] erro ao buscar usuário original:", originalUserError)

			return {
				success: false,
				message: "Não foi possível atualizar seus dados. Usuário não encontrado."
			}
		}

		// 2) Atualizar tabela public.users
		const updateUserRes = await updatePublicUserRepo({
			userId,
			update: {
				name
			}
		})

		if (updateUserRes.error) {
			console.error("[updateMyAccountService] erro ao atualizar users:", updateUserRes.error)

			return {
				success: false,
				message: "Não foi possível atualizar seus dados. Tente novamente."
			}
		}

		if (!originalUser.profile) {
			console.error("[updateMyAccountService]: Erro ao buscar dados de profile de um usuário.")

			return {
				success: false,
				message: "Não foi possível atualizar seus dados. Tente novamente."
			}
		}

		// 3) Upsert em user_profiles
		const profileUpdate: UserProfileUpdate = {
			phone,

			cep,
			street,
			number,
			complement,
			neighborhood,
			city,
			state
		}

		const updateProfileRes = await updateUserProfileRepo({
			userId,
			update: profileUpdate
		})

		if (updateProfileRes.error) {
			console.error("[updateMyAccountService] erro ao upsert em user_profiles:", updateProfileRes.error)

			// 3.1) Rollback best-effort na tabela users
			const rollbackRes = await updatePublicUserRepo({
				userId,
				update: {
					name: originalUser.name
				}
			})

			if (rollbackRes.error) {
				console.error("[updateMyAccountService] erro ao fazer rollback em users:", rollbackRes.error)
			}

			return {
				success: false,
				message: "Não foi possível atualizar seus dados. Nenhuma alteração permanente foi aplicada."
			}
		}

		return {
			success: true,
			message: "Dados atualizados com sucesso.",
			data: null
		}
	} catch (err) {
		console.error("[updateMyAccountService] erro inesperado:", err)

		return {
			success: false,
			message: "Erro inesperado ao atualizar seus dados."
		}
	}
}

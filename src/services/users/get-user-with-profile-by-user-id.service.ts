// src/services/user/get-user-with-profile-by-user-id.service.ts
import { findUserWithProfileByUserIdRepo } from "@/repositories/public-users/public-users.repo"
import type { OperationResponse } from "@/types/operation-response"

interface UserProfileData {
	phone: string
	cep: string
	street: string
	number: string
	complement: string | undefined
	neighborhood: string
	city: string
	state: string
}

interface UserWithProfile {
	id: string
	name: string
	email: string
	created_at: string
	profile: UserProfileData
}

export async function getUserWithProfileByUserIdService({ userId }: { userId: string }): Promise<OperationResponse<{ user: UserWithProfile }>> {
	try {
		const { data: userWithProfileData, error: userWithProfileError } = await findUserWithProfileByUserIdRepo({ userId })

		if (userWithProfileError) {
			console.error("[getUserWithProfileByUserIdService]:", userWithProfileError.message)

			return {
				success: false,
				message: "Erro ao buscar dados do usuário."
			}
		}

		if (!userWithProfileData || !userWithProfileData.profile) {
			return {
				success: false,
				message: "Usuário não encontrado."
			}
		}

		return {
			success: true,
			message: "Dados do usuário obtidos com sucesso.",
			data: {
				user: userWithProfileData as UserWithProfile
			}
		}
	} catch (err) {
		console.error("[getUserWithProfileByUserIdService]: Unexpected error", err)

		return {
			success: false,
			message: "Erro inesperado ao buscar dados do usuário."
		}
	}
}

import { getPublicUserByUserIdAdminRepo } from "@/repositories/public-users/public-users.admin.repo"
import type { PublicUserRow } from "@/types/domain/users/user-base.types"
import type { OperationResponse } from "@/types/operation-response"

export async function findPublicUserByUserIdService({ userId }: { userId: string }): Promise<OperationResponse<{ user: PublicUserRow | null }>> {
	try {
		const { data: publicUserData, error: publicUserError } = await getPublicUserByUserIdAdminRepo({ userId })

		if (publicUserError) {
			console.error(`[findPublicUserByUserIdService]: ${publicUserError.message}`)

			return {
				success: false,
				message: "Não foi possível buscar dados do usuário."
			}
		}

		return {
			success: true,
			message: "Dados do usuário buscados com sucesso!",
			data: {
				user: publicUserData
			}
		}
	} catch (err) {
		console.error("[findPublicUserByUserIdService]: Unexpected error", err)

		return {
			success: false,
			message: "Erro inesperado ao obter membros da organização."
		}
	}
}

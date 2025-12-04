import { signOutAuthUserRepo } from "@/repositories/auth-users/auth-users.repo"
import type { OperationResponse } from "@/types/operation-response"

export default async function signOutAuthUserService(): Promise<OperationResponse<null>> {
	const { error: authUserError } = await signOutAuthUserRepo()

	if (authUserError) {
		console.error(`[signOutAuthUserService]: ${authUserError.message}`)

		return {
			success: false,
			message: "Algo deu errado, tente novamente mais tarde."
		}
	}

	return {
		success: true,
		message: "Usuário deslogado com sucesso.",
		data: null
	}
}

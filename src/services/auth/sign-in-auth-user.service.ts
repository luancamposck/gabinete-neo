import { signInAuthUserRepo } from "@/repositories/auth-users/auth-users.repo"
import type { OperationResponse } from "@/types/operation-response"

export default async function signInAuthUserService(params: { email: string; password: string }): Promise<OperationResponse<{ userId: string }>> {
	const { data: authUserData, error: authUserError } = await signInAuthUserRepo(params)

	if (authUserError) {
		if (authUserError.code === "invalid_credentials") {
			return {
				success: false,
				message: "Usuário e/ou senha inválida(s)."
			}
		}
		console.error(`[signInAuthUserService]: ${authUserError.message}`)
		return {
			success: false,
			message: "Algo deu errado, tente novamente mais tarde."
		}
	}

	const userId = authUserData.user.id

	return {
		success: true,
		message: "Usuário logado com sucesso.",
		data: {
			userId: userId
		}
	}
}

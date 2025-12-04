import "server-only"

import { createAuthUserAdminRepo, deleteAuthUserAdminRepo } from "@/repositories/auth-users/auth-users.admin.repo"
import { insertPublicUserAdminRepo, type PublicUserInsert } from "@/repositories/public-users/public-users.admin.repo"
import { insertUserProfileAdminRepo, type UserProfileInsert } from "@/repositories/user-profiles/user-profiles.admin.repo"
import type { OperationResponse } from "@/types/operation-response"

export type CreateUserServiceParams = Omit<UserProfileInsert, "user_id"> & {
	email: string
	password: string
	name: string
}

/**
 * Cria um novo usuário no sistema, provisionando tanto o registro
 * de autenticação (auth.users) quanto o registro público (public.users).
 *
 * Caso a criação no banco público falhe, o service remove automaticamente
 * o usuário criado em auth.users para evitar inconsistências.
 *
 * @param {CreateUserServiceParams} params - Dados necessários para a criação:
 *   - email: E-mail do usuário
 *   - password: Senha para autenticação
 *   - name: Nome do usuário para registro público
 * @returns {Promise<OperationResponse<{ id: string }>>} Resultado padronizado da operação
 *   que inclui sucesso, mensagem e dados públicos cadastrados.
 *
 * @example
 * const result = await createUserWithProfileService({
 *   email: "john@example.com",
 *   password: "123456",
 *   name: "John Doe"
 * });
 *
 * if (result.success) {
 *   console.log("Criado:", result.data);
 * }
 */
export async function createUserWithProfileService(params: CreateUserServiceParams): Promise<OperationResponse<{ id: string }>> {
	let newAuthUserId: string | null = null

	try {
		// Cria auth user em auth.users
		const authUserParams = {
			email: params.email,
			password: params.password
		}

		const { data: authUserResData, error: authUserResError } = await createAuthUserAdminRepo(authUserParams)
		if (authUserResError || !authUserResData) {
			console.error(authUserResError)
			let errorMessage = "Não foi possível criar o usuário de autenticação."

			if (authUserResError?.code === "email_exists") {
				errorMessage = "Este e-mail já está registrado no sistema."
			}

			return { success: false, message: errorMessage }
		}
		newAuthUserId = authUserResData.user.id

		// Cria public user em public.users
		const publicUserParams: PublicUserInsert = {
			id: authUserResData.user.id,
			email: params.email,
			name: params.name
		}

		const { data: publicUserResData, error: publicUserResError } = await insertPublicUserAdminRepo(publicUserParams)

		if (publicUserResError || !publicUserResData) {
			console.error(publicUserResError)

			await deleteAuthUserAdminRepo({ authUserId: authUserResData.user.id })

			let errorMessage = "Falha ao provisionar usuário no banco."

			if (publicUserResError.code === "23505") {
				errorMessage = "Este e-mail já está registrado no sistema."
			}

			return { success: false, message: errorMessage }
		}

		// Cria instância em public.user_profiles
		const userProfileParams: UserProfileInsert = {
			user_id: authUserResData.user.id,
			cep: params.cep,
			city: params.city,
			cpf: params.cpf,
			neighborhood: params.neighborhood,
			number: params.number,
			street: params.street,
			phone: params.phone,
			state: params.state,
			complement: params.complement
		}

		const { data: userProfileResData, error: userProfileResError } = await insertUserProfileAdminRepo(userProfileParams)

		if (userProfileResError || !userProfileResData) {
			console.error(userProfileResError)

			await deleteAuthUserAdminRepo({ authUserId: authUserResData.user.id })

			let errorMessage = "Falha ao provisionar perfil de usuário."

			if (userProfileResError.code === "23505") {
				errorMessage = "Já existe um perfil com esse CPF cadastrado no sistema."
			}

			return { success: false, message: errorMessage }
		}

		return {
			success: true,
			message: "Usuário criado com sucesso.",
			data: publicUserResData
		}
	} catch (error) {
		console.error(error)

		if (newAuthUserId) {
			await deleteAuthUserAdminRepo({ authUserId: newAuthUserId })
		}
		return {
			success: false,
			message: "Erro inesperado ao criar usuário."
		}
	}
}

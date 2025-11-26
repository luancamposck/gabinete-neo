"use server"

import { AuthError, type User } from "@supabase/supabase-js"

import { supabaseAdmin } from "@/lib/supabase/admin"
import type { ActionResponse } from "@/types/action-response"

type SignUpParams = {
	email: string
	password: string
	name: string
	cpf: string
}

type SignUpData = {
	user: User | null
}

// Mensagens específicas para fluxos de cadastro
const SIGN_UP_ERROR_MESSAGES = new Map<string, string>([
	["email_exists", "Este email já está cadastrado"],
	["email_address_invalid", "Informe um email válido"],
	["user_already_exists", "Este usuário já existe"],
	["weak_password", "A senha deve ter pelo menos 6 caracteres"],
	["password_too_short", "A senha é muito curta"],
	["signup_disabled", "Cadastros estão temporariamente desabilitados"],
	["over_request_rate_limit", "Muitas tentativas. Por favor, aguarde alguns minutos para tentar novamente"],
	["email_rate_limit_exceeded", "Limite de emails excedido. Tente novamente mais tarde"],
	["unexpected_failure", "Erro inesperado. Tente novamente em instantes"],
	["validation_failed", "Dados inválidos. Verifique as informações fornecidas"]
])

// Função auxiliar para obter mensagem de erro amigável
function getAuthErrorMessage(errorCode?: string, defaultMessage?: string): string {
	if (!errorCode) {
		return defaultMessage || "Erro ao processar sua solicitação"
	}

	return SIGN_UP_ERROR_MESSAGES.get(errorCode) || defaultMessage || "Erro ao processar sua solicitação"
}

async function signUp({ email, password, name, cpf }: SignUpParams): Promise<ActionResponse<SignUpData>> {
	let userId: string | null = null

	try {
		// 1. Tentar criar usuário no auth.users
		const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
			email,
			password,
			email_confirm: true
		})

		if (authError) {
			const errorMessage = getAuthErrorMessage(authError.code, authError.message)

			console.error("Supabase signUp error", authError)

			return {
				success: false,
				message: errorMessage
			}
		}

		if (!authData.user) {
			return {
				success: false,
				message: "Erro ao criar conta: usuário não foi criado"
			}
		}

		userId = authData.user.id

		// 2. Tentar adicionar na tabela public.users
		const { error: dbError } = await supabaseAdmin.from("users").insert({
			id: userId,
			email,
			nome: name,
			cpf
		})

		if (dbError) {
			console.error("Error inserting into public.users", dbError)

			// 3. Se falhou, deletar o usuário do auth.users
			try {
				const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)

				if (deleteError) {
					console.error("Error deleting user after failed insert", deleteError)
					// Mesmo que falhe ao deletar, informamos o erro principal
				}
			} catch (deleteErr) {
				console.error("Exception while deleting user", deleteErr)
			}

			return {
				success: false,
				message: "Erro ao completar cadastro. Por favor, tente novamente"
			}
		}

		return {
			success: true,
			message: "Conta criada com sucesso",
			data: {
				user: authData.user
			}
		}
	} catch (error) {
		// Se algo inesperado acontecer e temos um userId, tentar deletar
		if (userId) {
			try {
				await supabaseAdmin.auth.admin.deleteUser(userId)
			} catch (deleteErr) {
				console.error("Exception while deleting user in catch block", deleteErr)
			}
		}

		if (error instanceof AuthError) {
			console.error("Supabase signUp throw", error)
			return {
				success: false,
				message: getAuthErrorMessage(error.code, error.message)
			}
		}

		console.error("signUp unexpected error", error)
		return {
			success: false,
			message: error instanceof Error ? error.message : "Erro inesperado ao criar conta"
		}
	}
}

export default signUp

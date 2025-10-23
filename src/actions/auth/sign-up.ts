"use server"

import { AuthError, type User } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/server"
import type { ActionResponse } from "@/types/action-response"

type SignUpParams = {
  email: string
  password: string
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
  [
    "over_request_rate_limit",
    "Muitas tentativas. Por favor, aguarde alguns minutos para tentar novamente"
  ],
  [
    "email_rate_limit_exceeded",
    "Limite de emails excedido. Tente novamente mais tarde"
  ],
  ["unexpected_failure", "Erro inesperado. Tente novamente em instantes"],
  ["validation_failed", "Dados inválidos. Verifique as informações fornecidas"]
])

// Função auxiliar para obter mensagem de erro amigável
function getAuthErrorMessage(
  errorCode?: string,
  defaultMessage?: string
): string {
  if (!errorCode) {
    return defaultMessage || "Erro ao processar sua solicitação"
  }

  return (
    SIGN_UP_ERROR_MESSAGES.get(errorCode) ||
    defaultMessage ||
    "Erro ao processar sua solicitação"
  )
}

export default async function signUp({
  email,
  password
}: SignUpParams): Promise<ActionResponse<SignUpData>> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    })

    if (error) {
      const errorMessage = getAuthErrorMessage(error.code, error.message)

      console.error("Supabase signUp error", error)
      return {
        success: false,
        message: errorMessage
      }
    }

    return {
      success: true,
      message: "Conta criada com sucesso",
      data: {
        user: data.user
      }
    }
  } catch (error) {
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
      message:
        error instanceof Error
          ? error.message
          : "Erro inesperado ao criar conta"
    }
  }
}

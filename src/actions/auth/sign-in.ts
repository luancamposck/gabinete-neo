"use server"

import { createClient } from "@/lib/supabase/server"
import type { ActionResponse } from "@/types/action-response"
import type { Session, User } from "@supabase/supabase-js"

type SignInParams = {
  email: string
  password: string
}

type SignInData = {
  user: User | null
  session: Session | null
}

export default async function signInAction({
  email,
  password,
}: SignInParams): Promise<ActionResponse<SignInData>> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return {
        success: false,
        message: error.message,
      }
    }

    return {
      success: true,
      message: "Autenticado com sucesso",
      data,
    }
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Erro inesperado ao realizar login",
    }
  }
}

"use server"

import type { User } from "@supabase/supabase-js"

import { createClient } from "@/lib/supabase/server"
import type { ActionResponse } from "@/types/action-response"

export async function getSessionAction(): Promise<ActionResponse<User>> {
	try {
		const supabase = await createClient()
		const { data, error } = await supabase.auth.getUser()

		if (error || !data?.user) {
			return {
				success: false,
				message: "Sessão não encontrada"
			}
		}

		return {
			success: true,
			message: "Sessão ativa",
			data: data.user
		}
	} catch {
		return {
			success: false,
			message: "Sessão não encontrada"
		}
	}
}

export default getSessionAction

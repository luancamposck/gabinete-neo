"use server"

import type { MailingListTable } from "@/lib/definitions/mailing-list"
import { createClient } from "@/lib/supabase/server"
import { translateSupabaseError } from "@/lib/utils"
import type { ActionResponse } from "@/types/action-response"

async function getMailingList(): Promise<ActionResponse<MailingListTable[]>> {
	const supabase = await createClient()

	try {
		const { data, error } = await supabase.from("mailing_list").select("*").order("created_at", { ascending: false })

		if (error) {
			const message = translateSupabaseError(error.code, "Não foi possível carregar a lista de contatos.")
			return { success: false, message }
		}

		if (!data || data.length === 0) {
			return { success: true, message: "Nenhum contato encontrado.", data: [] }
		}

		return {
			success: true,
			message: "Lista carregada com sucesso.",
			data
		}
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro desconhecido."
		return { success: false, message: errorMessage }
	}
}

export default getMailingList

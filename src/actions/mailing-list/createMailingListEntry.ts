"use server"

import type { MailingListInsert } from "@/lib/definitions/mailing-list"
import { createClient } from "@/lib/supabase/server"
import { translateSupabaseError } from "@/lib/utils/translate-supabase-error"
import type { ActionResponse } from "@/types/action-response"

async function createMailingListEntry(
  data: MailingListInsert
): Promise<ActionResponse<{ id: string }>> {
  const supabase = await createClient()

  try {
    const { data: inserted, error } = await supabase
      .from("mailing_list")
      .insert(data)
      .select("id")
      .single()

    if (error) {
      const message = translateSupabaseError(
        error.code,
        "Ocorreu um erro ao adicionar o contato."
      )
      return { success: false, message }
    }

    if (!inserted) {
      return {
        success: false,
        message: "Não foi possível adicionar o contato."
      }
    }

    return {
      success: true,
      message: "Contato adicionado com sucesso.",
      data: inserted
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Ocorreu um erro desconhecido."
    return { success: false, message: errorMessage }
  }
}

export default createMailingListEntry

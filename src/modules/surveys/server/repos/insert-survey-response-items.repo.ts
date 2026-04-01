import { createClient } from "@/lib/supabase/server"
import type { SurveyResponseItemInsert } from "@/modules/surveys/shared/types/db"

export async function insertSurveyResponseItemsRepo(params: SurveyResponseItemInsert[]) {
	const supabase = await createClient()

	return supabase.from("survey_response_items").insert(params)
}

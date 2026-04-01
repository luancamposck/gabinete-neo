import { createClient } from "@/lib/supabase/server"
import type { SurveyResponseInsert } from "@/modules/surveys/shared/types/db"

export async function insertSurveyResponseRepo(params: SurveyResponseInsert) {
	const supabase = await createClient()

	return supabase.from("survey_responses").insert(params)
}

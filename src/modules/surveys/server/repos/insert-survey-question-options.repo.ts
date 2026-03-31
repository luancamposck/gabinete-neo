import { createClient } from "@/lib/supabase/server"
import type { TablesInsert } from "@/shared/types/supabase"

export async function insertSurveyQuestionOptionsRepo(params: TablesInsert<"survey_question_options">[]) {
	const supabase = await createClient()

	return supabase.from("survey_question_options").insert(params).select("*")
}

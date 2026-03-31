import { createClient } from "@/lib/supabase/server"
import type { TablesInsert } from "@/shared/types/supabase"

export async function insertSurveyQuestionsRepo(params: TablesInsert<"survey_questions">[]) {
	const supabase = await createClient()

	return supabase.from("survey_questions").insert(params).select("*")
}

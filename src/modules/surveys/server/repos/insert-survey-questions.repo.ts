import { createClient } from "@/lib/supabase/server"
import type { SurveyQuestionInsert } from "@/modules/surveys/shared/types/db"

export async function insertSurveyQuestionsRepo(params: SurveyQuestionInsert[]) {
	const supabase = await createClient()

	return supabase.from("survey_questions").insert(params).select("*")
}

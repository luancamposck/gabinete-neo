import { createClient } from "@/lib/supabase/server"
import type { SurveyQuestionOptionInsert } from "@/modules/surveys/shared/types/db"

export async function insertSurveyQuestionOptionsRepo(params: SurveyQuestionOptionInsert[]) {
	const supabase = await createClient()

	return supabase.from("survey_question_options").insert(params).select("*")
}

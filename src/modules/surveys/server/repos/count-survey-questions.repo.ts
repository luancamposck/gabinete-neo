import { createClient } from "@/lib/supabase/server"

export async function countSurveyQuestionsRepo(params: { surveyId: string }) {
	const supabase = await createClient()

	return supabase.from("survey_questions").select("id", { count: "exact", head: true }).eq("survey_id", params.surveyId)
}

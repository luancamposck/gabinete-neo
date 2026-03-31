import { createClient } from "@/lib/supabase/server"

export async function deleteSurveyQuestionsBySurveyIdRepo(params: { surveyId: string }) {
	const supabase = await createClient()

	return supabase.from("survey_questions").delete().eq("survey_id", params.surveyId)
}

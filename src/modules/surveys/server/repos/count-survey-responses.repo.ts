import { createClient } from "@/lib/supabase/server"

export async function countSurveyResponsesRepo(params: { surveyId: string }) {
	const supabase = await createClient()

	return supabase.from("survey_responses").select("id", { count: "exact", head: true }).eq("survey_id", params.surveyId)
}

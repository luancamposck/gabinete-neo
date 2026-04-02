import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"

export async function countSurveyResponsesAdminRepo(params: { surveyId: string }) {
	const supabaseAdmin = createAdminClient()

	return supabaseAdmin.from("survey_responses").select("id", { count: "exact", head: true }).eq("survey_id", params.surveyId)
}

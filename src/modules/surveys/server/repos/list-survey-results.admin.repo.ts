import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"

export async function listSurveyResultsAdminRepo(params: { surveyId: string }) {
	const supabaseAdmin = createAdminClient()

	return supabaseAdmin
		.from("survey_questions")
		.select("id,title,description,type,required,position,survey_question_options(id,label,value,position),survey_response_items(response_id,answer_option_ids_json,answer_ranking_json)")
		.eq("survey_id", params.surveyId)
		.in("type", ["single_choice", "checkbox", "ranking"])
		.order("position", { ascending: true })
}

import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"

export async function listSurveyResultsAdminRepo(params: { surveyId: string }) {
	const supabaseAdmin = createAdminClient()

	return supabaseAdmin
		.from("survey_questions")
		.select(
			"id,title,description,type,required,position,survey_question_options(id,label,value,position),survey_response_items(response_id,answer_option_ids_json,answer_ranking_json),survey_response_items_safe(response_id,answer_text,submitted_at,is_anonymous,respondent_user_id,respondent_name,respondent_email,respondent_phone)"
		)
		.eq("survey_id", params.surveyId)
		.in("type", ["single_choice", "checkbox", "ranking", "textarea"])
		.order("position", { ascending: true })
}

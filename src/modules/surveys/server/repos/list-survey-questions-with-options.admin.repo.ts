import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"

export async function listSurveyQuestionsWithOptionsAdminRepo(params: { surveyId: string }) {
	const supabaseAdmin = createAdminClient()

	return supabaseAdmin
		.from("survey_questions")
		.select("id,title,description,type,required,position,config_json,survey_question_options(id,label,value,position)")
		.eq("survey_id", params.surveyId)
		.order("position", { ascending: true })
}

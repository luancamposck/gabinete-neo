import { createClient } from "@/lib/supabase/server"

export async function listSurveyQuestionsWithOptionsRepo(params: { surveyId: string }) {
	const supabase = await createClient()

	return supabase
		.from("survey_questions")
		.select("id,title,description,type,required,position,config_json,survey_question_options(id,label,value,position)")
		.eq("survey_id", params.surveyId)
		.order("position", { ascending: true })
}

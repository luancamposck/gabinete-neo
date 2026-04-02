import { createClient } from "@/lib/supabase/server"
import type { Json } from "@/shared/types/supabase"

type CreateSurveyWithQuestionsRepoParams = {
	organizationId: string
	createdByUserId: string
	title: string
	description: string | null
	visibility: "public" | "private"
	acceptAnonymousAnswers: boolean
	startsAt: string | null
	endsAt: string | null
	questions: Json
}

export async function createSurveyWithQuestionsRepo(params: CreateSurveyWithQuestionsRepoParams) {
	const supabase = await createClient()

	return supabase.rpc("create_survey_with_questions", {
		p_organization_id: params.organizationId,
		p_created_by_user_id: params.createdByUserId,
		p_title: params.title,
		p_description: params.description,
		p_visibility: params.visibility,
		p_accept_anonymous_answers: params.acceptAnonymousAnswers,
		p_starts_at: params.startsAt,
		p_ends_at: params.endsAt,
		p_questions: params.questions
	})
}

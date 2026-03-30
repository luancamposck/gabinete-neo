import { createClient } from "@/lib/supabase/server"
import type { SurveyRow } from "@/modules/surveys/shared/types/db"

type UpdateSurveyByIdRepoParams = {
	organizationId: string
	surveyId: string
	updates: Partial<Pick<SurveyRow, "title" | "description" | "visibility" | "accept_anonymous_answers" | "starts_at" | "ends_at" | "status">>
}

export async function updateSurveyByIdRepo(params: UpdateSurveyByIdRepoParams) {
	const supabase = await createClient()

	return supabase.from("surveys").update(params.updates).eq("organization_id", params.organizationId).eq("id", params.surveyId).select("*").maybeSingle()
}

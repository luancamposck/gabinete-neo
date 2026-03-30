import { createClient } from "@/lib/supabase/server"
import type { SurveyRow } from "@/modules/surveys/shared/types/db"

type InsertSurveyRepoParams = Pick<SurveyRow, "organization_id" | "title" | "description" | "visibility" | "accept_anonymous_answers" | "starts_at" | "ends_at" | "created_by_user_id"> & {
	status?: SurveyRow["status"]
}

export async function insertSurveyRepo(params: InsertSurveyRepoParams) {
	const supabase = await createClient()

	return supabase
		.from("surveys")
		.insert({
			organization_id: params.organization_id,
			title: params.title,
			description: params.description,
			visibility: params.visibility,
			accept_anonymous_answers: params.accept_anonymous_answers,
			starts_at: params.starts_at,
			ends_at: params.ends_at,
			created_by_user_id: params.created_by_user_id,
			status: params.status ?? "draft"
		})
		.select("*")
		.single()
}

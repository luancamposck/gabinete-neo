import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"

export async function findSurveyByIdAdminRepo(params: { surveyId: string }) {
	const supabaseAdmin = createAdminClient()

	return supabaseAdmin.from("surveys").select("*").eq("id", params.surveyId).maybeSingle()
}

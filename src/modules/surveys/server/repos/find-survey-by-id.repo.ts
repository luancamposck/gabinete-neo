import { createClient } from "@/lib/supabase/server"

export async function findSurveyByIdRepo(params: { organizationId: string; surveyId: string }) {
	const supabase = await createClient()

	return supabase.from("surveys").select("*").eq("organization_id", params.organizationId).eq("id", params.surveyId).maybeSingle()
}

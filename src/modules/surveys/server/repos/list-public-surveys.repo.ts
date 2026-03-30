import { createClient } from "@/lib/supabase/server"

export async function listPublicSurveysRepo(params: { organizationId: string }) {
	const { organizationId } = params
	const supabase = await createClient()

	return supabase.from("surveys").select("*").eq("organization_id", organizationId).eq("visibility", "public").eq("status", "published").order("created_at", { ascending: false })
}

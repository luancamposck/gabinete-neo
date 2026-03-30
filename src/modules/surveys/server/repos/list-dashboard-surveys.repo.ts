import { createClient } from "@/lib/supabase/server"

export async function listDashboardSurveysRepo(params: { organizationId: string }) {
	const { organizationId } = params
	const supabase = await createClient()

	return supabase.from("surveys").select("*").eq("organization_id", organizationId).in("visibility", ["public", "private"]).order("created_at", { ascending: false })
}

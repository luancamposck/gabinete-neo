// @/modules/fleet/server/repos/get-driver-application-by-id.admin.repo.ts
import { createAdminClient } from "@/lib/supabase/admin"

export async function getDriverApplicationByIdAdminRepo(params: { applicationId: string }) {
	const supabaseAdmin = createAdminClient()

	return supabaseAdmin.from("driver_applications").select("id, organization_id, status").eq("id", params.applicationId).maybeSingle()
}

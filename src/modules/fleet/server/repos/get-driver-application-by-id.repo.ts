// @/modules/fleet/server/repos/get-driver-application-by-id.repo.ts
import { createClient } from "@/lib/supabase/server"

export type DriverApplicationRow = {
	id: string
	organization_id: string
	user_id: string
	status: string
}

export async function getDriverApplicationByIdRepo(params: { applicationId: string }) {
	const supabase = await createClient()

	return supabase.from("driver_applications").select("id, organization_id, user_id, status").eq("id", params.applicationId).maybeSingle()
}

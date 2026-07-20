// @/modules/fleet/server/repos/get-driver-application-by-id.admin.repo.ts
import { createAdminClient } from "@/lib/supabase/admin"
import type { GetDriverApplicationByIdAdminRepoData } from "@/modules/fleet/shared/types/slices/review-driver-application.types"

export async function getDriverApplicationByIdAdminRepo(params: { applicationId: string }) {
	const supabaseAdmin = createAdminClient()

	const { data, error } = await supabaseAdmin.from("driver_applications").select("id, organization_id, status").eq("id", params.applicationId).maybeSingle()

	return { data: data as GetDriverApplicationByIdAdminRepoData | null, error }
}

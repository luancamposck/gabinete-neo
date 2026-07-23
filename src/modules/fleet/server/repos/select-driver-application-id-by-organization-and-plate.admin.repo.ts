// @/modules/fleet/server/repos/select-driver-application-id-by-organization-and-plate.admin.repo.ts

import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"
import type { SelectDriverApplicationIdByOrganizationAndPlateAdminRepoParams } from "@/modules/fleet/server/types/operations/check-plate-available.types"

export async function selectDriverApplicationIdByOrganizationAndPlateAdminRepo(params: SelectDriverApplicationIdByOrganizationAndPlateAdminRepoParams) {
	const supabaseAdmin = createAdminClient()

	return supabaseAdmin.from("driver_applications").select("id").eq("organization_id", params.organizationId).eq("plate", params.plate).in("status", ["pending", "approved"]).limit(1).maybeSingle()
}

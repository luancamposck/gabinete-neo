// @/modules/fleet/server/repos/select-pending-driver-application-id-by-organization-and-user.admin.repo.ts

import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"
import type { SelectPendingDriverApplicationIdByOrganizationAndUserAdminRepoParams } from "../../shared/types/slices/check-pending-driver-application.types"

export async function selectPendingDriverApplicationIdByOrganizationAndUserAdminRepo(params: SelectPendingDriverApplicationIdByOrganizationAndUserAdminRepoParams) {
	const supabaseAdmin = createAdminClient()

	return supabaseAdmin.from("driver_applications").select("id").eq("organization_id", params.organizationId).eq("user_id", params.userId).eq("status", "pending").limit(1).maybeSingle()
}

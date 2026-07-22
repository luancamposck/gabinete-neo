// @/modules/fleet/server/repos/list-pending-driver-application-user-ids-by-org-id.admin.repo.ts

import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"

export async function listPendingDriverApplicationUserIdsByOrgIdAdminRepo({ orgId }: { orgId: string }) {
	const supabaseAdmin = createAdminClient()

	return supabaseAdmin.from("driver_applications").select("user_id").eq("organization_id", orgId).eq("status", "pending")
}

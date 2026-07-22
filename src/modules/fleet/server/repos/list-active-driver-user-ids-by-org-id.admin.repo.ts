// @/modules/fleet/server/repos/list-active-driver-user-ids-by-org-id.admin.repo.ts

import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"

export async function listActiveDriverUserIdsByOrgIdAdminRepo({ orgId }: { orgId: string }) {
	const supabaseAdmin = createAdminClient()

	return supabaseAdmin.from("drivers").select("user_id").eq("organization_id", orgId).eq("is_active", true)
}

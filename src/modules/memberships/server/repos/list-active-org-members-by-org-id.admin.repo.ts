// @/modules/memberships/server/repos/list-active-org-members-by-org-id.admin.repo.ts

import { createAdminClient } from "@/lib/supabase/admin"

export async function listActiveOrgMembersByOrgIdAdminRepo({ orgId }: { orgId: string }) {
	const supabaseAdmin = createAdminClient()

	return supabaseAdmin
		.from("memberships")
		.select(
			`
      user_id,
      user:users!memberships_user_id_fkey!inner (
        name,
        username,
        email
      )
    `
		)
		.eq("organization_id", orgId)
		.eq("is_active", true)
		.order("created_at", { ascending: true })
}

// @/modules/organizations/memberships/server/repos/insert-membership.admin.repo.ts

import { createAdminClient } from "@/lib/supabase/admin"
import type { MembershipInsert } from "@/modules/organizations/memberships/shared/types/db"

export async function insertOrganizationMembershipAdminRepo(insertParams: MembershipInsert) {
	const supabaseAdmin = createAdminClient()

	return supabaseAdmin.from("organization_memberships").insert(insertParams).select("organization_id, user_id").single()
}

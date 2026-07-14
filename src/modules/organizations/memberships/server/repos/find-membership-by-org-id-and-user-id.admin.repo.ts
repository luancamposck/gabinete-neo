// @/modules/organizations/memberships/server/repos/find-membership-by-org-id-and-user-id.admin.repo.ts

import { createAdminClient } from "@/lib/supabase/admin"

type FindMembershipByOrgAndUserParams = {
	organizationId: string
	userId: string
}

export async function findMembershipByOrgAndUserAdminRepo(params: FindMembershipByOrgAndUserParams) {
	const supabaseAdmin = createAdminClient()

	return supabaseAdmin.from("memberships").select("is_active").eq("organization_id", params.organizationId).eq("user_id", params.userId).maybeSingle()
}

// @/modules/organizations/memberships/server/repos/update-membership-by-org-and-user-id.admin.repo.ts

import { createAdminClient } from "@/lib/supabase/admin"
import type { MembershipUpdate } from "@/modules/organizations/memberships/shared/types/db"

type UpdateMembershipByOrgAndUserIdAdminRepoParams = {
	organizationId: string
	userId: string
	patch: MembershipUpdate
}

export async function updateMembershipByOrgAndUserIdAdminRepo({ organizationId, userId, patch }: UpdateMembershipByOrgAndUserIdAdminRepoParams) {
	const supabaseAdmin = createAdminClient()

	return supabaseAdmin.from("memberships").update(patch).eq("organization_id", organizationId).eq("user_id", userId).select("organization_id, user_id").maybeSingle()
}

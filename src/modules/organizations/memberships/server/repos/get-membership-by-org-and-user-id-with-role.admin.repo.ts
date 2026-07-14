// @/modules/organizations/memberships/server/repos/get-membership-by-org-and-user-id-with-role.admin.repo.ts

import { createAdminClient } from "@/lib/supabase/admin"

type GetMembershipByOrgAndUserIdWithRoleAdminRepoParams = {
	organizationId: string
	userId: string
}

export async function getMembershipByOrgAndUserIdWithRoleAdminRepo({ organizationId, userId }: GetMembershipByOrgAndUserIdWithRoleAdminRepoParams) {
	const supabaseAdmin = createAdminClient()

	return supabaseAdmin
		.from("memberships")
		.select(
			`
			organization_id,
			user_id,
			is_active,
			role:roles!memberships_role_id_fkey (
				name
			)
		`
		)
		.eq("organization_id", organizationId)
		.eq("user_id", userId)
		.maybeSingle()
}

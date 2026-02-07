// @/modules/organizations/memberships/server/repos/insert-membership.admin.repo.ts

import { createAdminClient } from "@/lib/supabase/admin"

interface GetRoleAdminRepoParams {
	organizationId: string
	name: string
}

export async function getRoleAdminRepo({ name, organizationId }: GetRoleAdminRepoParams) {
	const supabaseAdmin = createAdminClient()

	return supabaseAdmin.from("roles").select("*").eq("organization_id", organizationId).eq("name", name).maybeSingle()
}

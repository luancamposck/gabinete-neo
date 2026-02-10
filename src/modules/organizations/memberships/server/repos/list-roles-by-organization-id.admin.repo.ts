// @/modules/organizations/memberships/server/repos/list-roles-by-organization-id.admin.repo.ts

import { createAdminClient } from "@/lib/supabase/admin"

export async function listRolesByOrganizationIdAdminRepo({ organizationId }: { organizationId: string }) {
	const supabaseAdmin = createAdminClient()

	return supabaseAdmin.from("roles").select("*").eq("organization_id", organizationId).eq("is_active", true)
}

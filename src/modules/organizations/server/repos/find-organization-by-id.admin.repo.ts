// @/modules/organizations/server/repos/find-organization-id-by-app-domain.admin.repo.ts

import { createAdminClient } from "@/lib/supabase/admin"

export async function findOrganizationByIdAdminRepo({ organizationId }: { organizationId: string }) {
	const supabaseAdmin = createAdminClient()

	return supabaseAdmin.from("organizations").select("*").eq("id", organizationId).maybeSingle()
}

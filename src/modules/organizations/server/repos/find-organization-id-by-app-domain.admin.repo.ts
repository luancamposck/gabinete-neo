// @/modules/organizations/server/repos/find-organization-id-by-app-domain.admin.repo.ts

import { createAdminClient } from "@/lib/supabase/admin"

export async function findOrganizationIdByAppDomainAdminRepo({ appDomain }: { appDomain: string }) {
	const supabaseAdmin = createAdminClient()

	return supabaseAdmin.from("organizations").select("id").eq("app_domain", appDomain).maybeSingle()
}

// @/modules/organizations/server/repos/update-organization.admin.repo.ts
// Repo genérico para atualizar dados da organização.

import { createAdminClient } from "@/lib/supabase/admin"
import type { OrganizationUpdate } from "@/modules/organizations/shared/types/db"

type UpdateOrganizationRepoParams = {
	organizationId: string
	updates: OrganizationUpdate
}

export async function updateOrganizationAdminRepo({ organizationId, updates }: UpdateOrganizationRepoParams) {
	const supabase = createAdminClient()

	return supabase.from("organizations").update(updates).eq("id", organizationId).select("*").single()
}

// @/modules/organizations/server/repos/update-organization.repo.ts
// Repo genérico para atualizar dados da organização.

import { createClient } from "@/lib/supabase/server"
import type { OrganizationUpdate } from "@/modules/organizations/shared/types/db"

type UpdateOrganizationRepoParams = {
	organizationId: string
	updates: OrganizationUpdate
}

export async function updateOrganizationRepo({ organizationId, updates }: UpdateOrganizationRepoParams) {
	const supabase = await createClient()

	return supabase.from("organizations").update(updates).eq("id", organizationId).select("*").single()
}

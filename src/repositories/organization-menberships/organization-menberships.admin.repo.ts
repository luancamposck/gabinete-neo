import type { PostgrestSingleResponse } from "@supabase/supabase-js"

import type { TablesInsert } from "@/lib/definitions/supabase"
import { createAdminClient } from "@/lib/supabase/admin"

export type OrganizationMenbershipsInsert = TablesInsert<"organization_memberships">

export async function insertOrganizationMenbershipsAdminRepo(organizationMenbershipsParams: OrganizationMenbershipsInsert): Promise<PostgrestSingleResponse<{ organization_id: string; user_id: string }>> {
	const supabaseAdmin = createAdminClient()

	return supabaseAdmin.from("organization_memberships").insert(organizationMenbershipsParams).select("*").single()
}

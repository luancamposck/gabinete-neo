import type { PostgrestSingleResponse } from "@supabase/supabase-js"

import type { TablesInsert } from "@/lib/definitions/supabase"
import { createAdminClient } from "@/lib/supabase/admin"

export type OrganizationsInsert = TablesInsert<"organizations">

export async function insertOrganizationsAdminRepo(insertOrganizationsParams: OrganizationsInsert): Promise<PostgrestSingleResponse<{ id: string }>> {
	const supabaseAdmin = createAdminClient()

	return supabaseAdmin.from("organizations").insert(insertOrganizationsParams).select("id").single()
}

export async function deleteOrganizationsAdminRepo({ organizationId }: { organizationId: string }) {
	const supabaseAdmin = createAdminClient()

	return supabaseAdmin.from("organizations").delete().eq("id", organizationId)
}

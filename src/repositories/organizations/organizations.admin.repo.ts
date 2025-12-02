import type { PostgrestSingleResponse } from "@supabase/supabase-js"

import type { Tables, TablesInsert } from "@/lib/definitions/supabase"
import { createAdminClient } from "@/lib/supabase/admin"

export type OrganizationsInsert = TablesInsert<"organizations">
export type OrganizationsRow = Tables<"organizations">

export async function insertOrganizationsAdminRepo(insertOrganizationsParams: OrganizationsInsert): Promise<PostgrestSingleResponse<{ id: string }>> {
	const supabaseAdmin = createAdminClient()

	return supabaseAdmin.from("organizations").insert(insertOrganizationsParams).select("id").single()
}

export async function deleteOrganizationsAdminRepo({ organizationId }: { organizationId: string }) {
	const supabaseAdmin = createAdminClient()

	return supabaseAdmin.from("organizations").delete().eq("id", organizationId)
}

export async function getOrganizationByOrganizationIdAdminRepo({ organizationId }: { organizationId: string }): Promise<PostgrestSingleResponse<OrganizationsRow>> {
	const supabaseAdmin = createAdminClient()

	return supabaseAdmin.from("organizations").select("*").eq("id", organizationId).single()
}

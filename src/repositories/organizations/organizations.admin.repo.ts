import type { PostgrestSingleResponse } from "@supabase/supabase-js"

import { createAdminClient } from "@/lib/supabase/admin"
import type { OrganizationsInsert, OrganizationsRow } from "@/types/domain/organization/organization-base.types"

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

export async function findOrganizationBySlugAdminRepo({ organizationSlug }: { organizationSlug: string }): Promise<PostgrestSingleResponse<OrganizationsRow | null>> {
	const supabaseAdmin = createAdminClient()

	return supabaseAdmin.from("organizations").select("*").eq("slug", organizationSlug).maybeSingle()
}

// src/repositories/organization-menberships/organization-menberships.admin.repo.ts
import "server-only"

import type { PostgrestSingleResponse } from "@supabase/supabase-js"

import { createAdminClient } from "@/lib/supabase/admin"
import type { OrganizationMenbershipsInsert } from "@/types/domain/organization/organization-memberships-base.types"

export async function insertOrganizationMenbershipsAdminRepo(organizationMenbershipsParams: OrganizationMenbershipsInsert): Promise<PostgrestSingleResponse<{ organization_id: string; user_id: string }>> {
	const supabaseAdmin = createAdminClient()

	return supabaseAdmin.from("organization_memberships").insert(organizationMenbershipsParams).select("*").single()
}

export async function findOrganizationMembershipByUserAdminRepo({ userId }: { userId: string }) {
	const supabaseAdmin = createAdminClient()

	return supabaseAdmin.from("organization_memberships").select("*").eq("user_id", userId).eq("is_active", true).maybeSingle()
}

// 👇 NOVO: usado pro rollback manual
export async function deleteOrganizationMembershipAdminRepo({ organizationId, userId }: { organizationId: string; userId: string }) {
	const supabaseAdmin = createAdminClient()

	return supabaseAdmin.from("organization_memberships").delete().eq("organization_id", organizationId).eq("user_id", userId)
}

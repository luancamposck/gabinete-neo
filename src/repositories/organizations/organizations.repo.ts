// src/repositories/organizations/organizations.repo.ts

import type { PostgrestSingleResponse } from "@supabase/supabase-js"

import { createClient } from "@/lib/supabase/server"
import type { OrganizationsRow } from "@/types/domain/organization/organization-base.types"

export async function findOrganizationByIdRepo(organizationId: string): Promise<PostgrestSingleResponse<OrganizationsRow>> {
	const supabase = await createClient()

	return supabase.from("organizations").select("*").eq("id", organizationId).single()
}

// ---------------------- Casos de uso para tables ----------------------
export async function findOrganizationMembershipWithOrganizationByUserIdRepo({ userId }: { userId: string }) {
	const supabase = await createClient()

	return supabase
		.from("organization_memberships")
		.select(
			`
      organization_id,
      user_id,
      role_id,
      is_active,
      created_at,
      invited_by_user_id,
      organization:organizations (
        id,
        name,
        slug,
        created_at
      )
    `
		)
		.eq("user_id", userId)
		.eq("is_active", true)
		.maybeSingle()
}

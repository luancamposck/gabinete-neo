// src/repositories/organizations/organizations.repo.ts

import type { PostgrestSingleResponse } from "@supabase/supabase-js"

import { createClient } from "@/lib/supabase/server"
import type { OrganizationsRow } from "@/types/domain/organization/organization-base.types"

export async function findOrganizationByIdRepo(organizationId: string): Promise<PostgrestSingleResponse<OrganizationsRow>> {
	const supabase = await createClient()

	return supabase.from("organizations").select("*").eq("id", organizationId).single()
}

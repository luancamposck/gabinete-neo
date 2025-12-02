// src/repositories/organizations/organizations.repo.ts

import type { PostgrestSingleResponse } from "@supabase/supabase-js"

import type { Tables } from "@/lib/definitions/supabase"
import { createClient } from "@/lib/supabase/server"

export type OrganizationsRow = Tables<"organizations">

export async function findOrganizationByIdRepo(organizationId: string): Promise<PostgrestSingleResponse<OrganizationsRow>> {
	const supabase = await createClient()

	return supabase.from("organizations").select("*").eq("id", organizationId).single()
}

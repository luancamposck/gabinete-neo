import type { PostgrestSingleResponse } from "@supabase/supabase-js"

import type { Tables, TablesInsert } from "@/lib/definitions/supabase"
import { createAdminClient } from "@/lib/supabase/admin"

export type PublicUserInsert = TablesInsert<"users">
export type PublicUserRow = Tables<"users">

export async function insertPublicUserAdminRepo(insertPublicUserParams: PublicUserInsert): Promise<PostgrestSingleResponse<{ id: string }>> {
	const supabaseAdmin = createAdminClient()

	return supabaseAdmin.from("users").insert(insertPublicUserParams).select("id").single()
}

export async function deletePublicUserAdminRepo({ publicUserId }: { publicUserId: string }) {
	const supabaseAdmin = createAdminClient()

	return supabaseAdmin.from("users").delete().eq("id", publicUserId)
}

export async function getPublicUserByUserIdAdminRepo({ userId}: {userId: string}): Promise<PostgrestSingleResponse<PublicUserRow>> {
	const supabaseAdmin = createAdminClient()

	return supabaseAdmin.from("users").select("*").eq("id", userId).single()
}
